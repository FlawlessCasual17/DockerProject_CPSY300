using System.Data;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using API.Database;
using API.Helpers;
using Z.EntityFramework.Plus;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.AspNetCore.Authorization;
namespace API;

public abstract class Program {
    const string Initial = "A student with the";

    /// <summary>
    /// Standard entry point. Nothing special.
    /// </summary>
    public static async Task Main() {
        var builder = WebApplication.CreateBuilder(); // Initialize the API server

        // Add a new CORS policy
        builder.Services.AddCors(opts =>
            opts.AddPolicy("CorsPolicy", builder => {
                builder.AllowAnyOrigin();
                builder.AllowAnyMethod();
                builder.AllowAnyHeader();
            })
        );
        // Add authorization services
        builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(opts => {
                opts.Authority = builder.Configuration["Api:Authority"];
                opts.Audience = builder.Configuration["Api:Audience"];
                opts.TokenValidationParameters = new TokenValidationParameters {
                    ValidateIssuer = true,
                    ValidateAudience = false,
                    ValidateLifetime = true
                };
                opts.SaveToken = true;
            });
        // Add authorization services
        builder.Services.AddAuthorizationBuilder()
            .SetDefaultPolicy(new AuthorizationPolicyBuilder()
                .RequireAuthenticatedUser().Build());
        builder.Services.AddRouting(); // Add routing services
        builder.Services.AddOpenApi(); // Add OpenAPI services

        var app = builder.Build(); // Build the API server

        app.UseCors("CorsPolicy"); // Enable CORS
        app.UseAuthentication(); // Enable authentication
        app.UseAuthorization(); // Enable authorization
        app.UseRouting(); // Enable routing
        app.MapOpenApi(); // Map the OpenAPI route

        // Initialize a new instance of the database
        var dbService = new Service();
        await dbService.Initialize();

        // Retrieve the database context
        var dbContext = dbService.GetDbContext();

        // Check if the database connection is open
        var dbContextDb = dbContext.Database;
        if (dbContextDb.GetDbConnection().State != ConnectionState.Open)
            await dbContextDb.OpenConnectionAsync();

        // Configure JSON serialization options.
        var options = new JsonSerializerOptions {
            Converters = { new DateOnlyConverter() },
            WriteIndented = true
        };

        // Create a route for GET requests
        app.MapGet("/student", [Authorize] async () => {
            // Retrieve all student data and return the results.
            var students = await dbContext.Students!.ToListAsync();
            return Results.Json(students, options, statusCode: 200);
        }).WithName("GetAllStudentData");

        // Create a route for GET requests (using the student's ID)
        app.MapGet("/student/{studentId}", [Authorize] async (string studentId) => {
            // Retrieve all student data
            var students = await dbContext.Students!.ToListAsync();

            // Check if a student does not exist
            var isNotExisting = students.Any(s => s.StudentId == studentId);

            if (!isNotExisting) return NotFoundReponse(studentId, options);

            // Find this student using the provided ID,
            // and return the results afterwards
            var stud = students.Find(s => s.StudentId == studentId);
            return Results.Json(stud, options, statusCode: 200);
        }).WithName("GetSpecificStudentData");

        // Create a route for POST requests
        app.MapPost("/student", [Authorize] async (Students stud) => {
            // For later use.
            var studentId = stud.StudentId;

            // Check if the student does exist
            var isExisting = await dbContext.Students!
                .AnyAsync(s => s.StudentId == studentId);

            var msg = $"{Initial} same ID, '{studentId}' already exists.";

            if (isExisting) return Results.Json(new { error = msg }, options, statusCode: 409);

            // Add the student
            dbContext.Students!.Add(stud);
            await dbContext.SaveChangesAsync(); // Save the changes.

            return Results.Created($"/student/{studentId}", stud);
        }).WithName("AddStudentData");

        // Create a route for PUT requests
        app.MapPut("/student/{studentId}", [Authorize] async (
            Students stud, string studentId
        ) => {
            // Set stud.studentId to studentId
            // from the route if the former is null
            if (string.IsNullOrEmpty(stud.StudentId)) stud.StudentId = studentId;

            // Check if a student does not exist
            var isNotExisting = await dbContext.Students!
                .AnyAsync(s => s.StudentId == studentId);

            if (!isNotExisting) return NotFoundReponse(studentId, options);

            // NOTE: DO NOT USE the `UpdateAsync` method.
            // It will cause the cloud Postgres database
            // to return an error code of 500.
            // This is because both the `UpdateAsync` and
            // `SaveChangesAsync` methods are both trying
            // to affect the same row.
            // The solution is to use the `Update` method.
            // Update the student data (synchronously).
            dbContext.Students!
                .Where(s => s.StudentId == studentId)
                .Update(s => new Students {
                    StudentId = stud.StudentId,
                    StudentName = string.IsNullOrEmpty(stud.StudentName) ?
                        s.StudentName : stud.StudentName,
                    CourseName = string.IsNullOrEmpty(stud.CourseName) ?
                        s.CourseName : stud.CourseName,
                    Date = stud.Date
                });
            await dbContext.SaveChangesAsync(); // Save the changes

            // Return the results.
            return Results.Created($"/student/{stud.StudentId}", stud);
        }).WithName("UpdateStudentData");

        // Create a route for DELETE requests (using the student's ID).
        app.MapDelete("/student/{studentId}", [Authorize] async (string studentId) => {
            // Check if a student does not exist.
            var isNotExisting = await dbContext.Students!
                .AnyAsync(s => s.StudentId == studentId);

            if (!isNotExisting) return NotFoundReponse(studentId, options);

            // Delete the student based on the provided ID
            dbContext.Students!.Where(s => s.StudentId == studentId).Delete();
            await dbContext.SaveChangesAsync(); // Save the changes.

            // Return a status code of 200 with a message.
            return Results.Json(new {
                message = "Student deleted successfully"
            }, options, statusCode: 200);
        }).WithName("DeleteSpecificStudentData");

        await app.RunAsync(); // Run the API server.
    }

    /// <summary>
    /// Returns a JSON response with a 404 error code.
    /// </summary>
    /// <param name="studentId">The student's ID</param>
    /// <param name="options">Configuration for JSON serialization</param>
    /// <returns>A JSON response with a 404 error code.</returns>
    static IResult NotFoundReponse(string studentId, JsonSerializerOptions options) =>
        Results.Json(new {
            error = new [] {
                $"{Initial} ID, '{studentId}' does not exist.",
                "Please create this new student using a POST request with this route:",
                "/student"
            }
        }, options, statusCode: 404);
}

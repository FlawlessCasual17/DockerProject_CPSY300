using System.Data;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using API.Database;
using Z.EntityFramework.Plus;
namespace API;

public abstract class Program {
    const string Initial = "A student with the";

    /// <summary>
    /// Standard entry point. Nothing special.
    /// </summary>
    public static async Task Main() {
        // Initialize the web API.
        var builder = WebApplication.CreateBuilder();

        // Add services to the container.
        // Learn more about configuring OpenAPI at
        // https://aka.ms/aspnet/openapi
        builder.Services.AddOpenApi();

        var app = builder.Build();

        // Configure the HTTP request pipeline.
        if (app.Environment.IsDevelopment()) app.MapOpenApi();

        app.UseHttpsRedirection(); // Enable HTTPS redirection.

        // Initialize a new instance of the database.
        var dbService = new Service();
        await dbService.Initialize();

        // Retrieve the database context.
        var dbContext = dbService.GetDbContext();

        // Check if the database connection is open
        var dbContextDb = dbContext.Database;
        if (dbContextDb.GetDbConnection().State != ConnectionState.Open)
            await dbContextDb.OpenConnectionAsync();

        // Configure JSON serialization options.
        var options = new JsonSerializerOptions { WriteIndented = true };

        // Create a route for GET requests.
        app.MapGet("/student", async () => {
            // Retrieve all student data and return the results.
            var students = await dbContext.Students.ToListAsync();
            return Results.Json(students, options);
        }).WithName("GetAllStudentData");

        // Create a route for GET requests (using the student's ID).
        app.MapGet("/student/{studentId}", async (string studentId) => {
            // Retrieve all student data.
            var students = (await dbContext.Students.ToListAsync());

            // Check if a student doesn't exist using the provided ID.
            var isExisting = students.Any(s => s.StudentId == studentId);

            if (!isExisting)
                return Results.Json(new {
                    error = ReqErrorMsg(studentId)
                }, options, statusCode: 404);

            // Find this student using the provided ID,
            // and return the results afterwards.
            var student = students.Find(s => s.StudentId == studentId);
            return Results.Json(student, options);
        }).WithName("GetSpecificStudentData");

        // Create a route for POST requests.
        app.MapPost("/student", async (Students stud) => {
            var date = stud.PresentDate;
            stud.PresentDate = date.ToUniversalTime();

            // For later use.
            var studentId = stud.StudentId;

            // Check if the student already exists
            var isExisting = await dbContext.Students
                .AnyAsync(s => s.StudentId == studentId);

            if (!isExisting)
                return Results.Json(new {
                    error = $"{Initial} same ID, '{studentId}' already exists."
                }, options, statusCode: 409);

            // Add the student
            dbContext.Students.Add(stud);
            await dbContext.SaveChangesAsync(); // Save the changes.

            return Results.Created($"/student/{studentId}", stud);
        }).WithName("AddStudentData");

        // Create a route for PUT requests.
        app.MapPut("/student/{studentId}", async (
            Students stud, string studentId
        ) => {
            var date = stud.PresentDate;
            stud.PresentDate = date.ToUniversalTime();

            // Set stud.studentId to studentId
            // from the route if the former is null.
            if (string.IsNullOrEmpty(stud.StudentId)) stud.StudentId = studentId;

            // Check if a student doesn't exist using the provided ID.
            var isExisting = await dbContext.Students
                .AnyAsync(s => s.StudentId == studentId);

            if (!isExisting)
                return Results.Json(new {
                    error = ReqErrorMsg(studentId)
                }, options, statusCode: 404);


            // NOTE: DO NOT USE the `UpdateAsync` method.
            // It will cause the cloud Postgres database
            // to return an error code of 500.
            // This is because both the `UpdateAsync` and
            // `SaveChangesAsync` methods are both trying
            // to affect the same row.
            // The solution is to use the `Update` method.
            // Update the student data (synchronously).
            dbContext.Students
                .Where(s => s.StudentId == studentId)
                .Update(s => new Students {
                    StudentId = stud.StudentId,
                    StudentName = string.IsNullOrEmpty(stud.StudentName) ?
                        s.StudentName : stud.StudentName,
                    Course = string.IsNullOrEmpty(stud.Course) ?
                        s.Course : stud.Course,
                    PresentDate = stud.PresentDate
                });
            await dbContext.SaveChangesAsync(); // Save the changes.

            // Return the results.
            return Results.Created($"/student/{stud.StudentId}", stud);
        }).WithName("UpdateStudentData");

        await app.RunAsync();
    }

    /// <summary>
    /// Returns an error message that advises the user
    /// to create a new student using a POST request.
    /// </summary>
    /// <param name="studentId">The student's ID</param>
    /// <returns>An error message in an array.</returns>
    static string[] ReqErrorMsg(string studentId) => [
        $"{Initial}, '{studentId}' does not exist.",
        "Please create this new student using a POST request with this route:",
        "/student"
    ];
}

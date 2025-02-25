using System.Data;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using API.Database;
namespace API;

public abstract class Program {
    public static async Task Main(string[] args) {
        var builder = WebApplication.CreateBuilder(args);

        // Add services to the container.
        // Learn more about configuring OpenAPI at
        // https://aka.ms/aspnet/openapi
        builder.Services.AddOpenApi();

        var app = builder.Build();

        // Configure the HTTP request pipeline.
        if (app.Environment.IsDevelopment()) app.MapOpenApi();

        app.UseHttpsRedirection(); // Enable HTTPS redirection

        // Initialize the database
        var dbService = new Service();
        await dbService.Initialize();

        // Retrieve the database context
        var dbContext = dbService.GetDbContext();

        // Check if the database connection is open
        if (dbContext.Database.GetDbConnection().State != ConnectionState.Open)
            await dbContext.Database.OpenConnectionAsync();

        // Configure JSON serialization options
        var options = new JsonSerializerOptions {
            WriteIndented = true
        };

        // Create a route for GET requests
        app.MapGet("/student", async () => {
            // Retrieve all student data
            var students = await dbContext.Students.ToListAsync();
            return Results.Json(students, options);
        }).WithName("GetAllStudentsData");

        // ReSharper disable once InconsistentNaming
        // Create a route for GET requests
        app.MapGet("/student/{studentID:int}", async (int studentID) => {
            // Retrieve all student data
            var students = await dbContext.Students.ToListAsync();
            var student = students.Find(s => s.studentID == studentID);
            return Results.Json(student, options);
        }).WithName("GetSpecificStudentData");

        // Create a route for POST requests
        app.MapPost("/student", async (Students student) => {
            var date = student.presentDate;
            student.presentDate = date.ToUniversalTime();

            // Check if the student already exists
            var existingStudent = await dbContext.Students
                .FirstOrDefaultAsync(s =>
                    s.studentID == student.studentID &&
                    s.studentName == student.studentName &&
                    s.course == student.course &&
                    s.presentDate == student.presentDate);

            if (existingStudent != null) {
                const string msg = "A student with the same data already exists.";
                return Results.Json(new { error = msg }, options, statusCode: 409);
            }

            // Add the student
            dbContext.Students.Add(student);
            await dbContext.SaveChangesAsync();

            var route = $"/student/{student.studentID}";
            return Results.Created(route, student);
        }).WithName("SendStudentData");

        // ReSharper disable once InconsistentNaming
        // Create a route for PUT requests
        app.MapPut("/student/{studentID:int}", async (
            int studentID, Students student
        ) => {
            var date = student.presentDate;
            student.presentDate = date.ToUniversalTime();

            // Check if the user did NOT provide
            // a studentID in the JSON body.
            // This is to make sure the studentID comes
            // from the URL, not the JSON body.
            if (student.studentID != 0) {
                string[] msg = [
                    "Please provide the 'studentID' in the URL, not in the JSON body.",
                    "The route format should be: /student/<studentID>"
                ];
                return Results.Json(new { error = msg }, options, statusCode: 400);
            }

            // Set the studentID to the studentID from the URL
            student.studentID = studentID;

            // Check if a student with the same
            // studentID already exists.
            var existingStudent = await dbContext.Students
                .FirstOrDefaultAsync(s => s.studentID == student.studentID);

            // Update or Add the student data
            if (existingStudent != null) dbContext.Students.Update(student);
            else dbContext.Students.Add(student);

            await dbContext.SaveChangesAsync();

            var route = $"/student/{student.studentID}";
            return Results.Created(route, student);
        }).WithName("UpdateOrAddStudentData");

        await app.RunAsync();
    }
}

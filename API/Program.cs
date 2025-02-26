using System.Data;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using API.Database;
using Z.EntityFramework.Plus;
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
        }).WithName("GetAllStudentData");

        // ReSharper disable once InconsistentNaming
        // Create a route for GET requests
        app.MapGet("/student/{studentID}", async (string studentID) => {
            // Retrieve all student data
            var students = await dbContext.Students.ToListAsync();
            var student = students.Find(s => s.StudentId == studentID);
            return Results.Json(student, options);
        }).WithName("GetSpecificStudentData");

        // Create a route for POST requests
        app.MapPost("/student", async (Students stud) => {
            var date = stud.PresentDate;
            stud.PresentDate = date.ToUniversalTime();

            // Check if the student already exists
            var existingStudent = await dbContext.Students
                .FirstOrDefaultAsync(s =>
                    s.StudentId == stud.StudentId &&
                    s.StudentName == stud.StudentName &&
                    s.Course == stud.Course &&
                    s.PresentDate == stud.PresentDate);

            if (existingStudent != null)
                return Results.Json(new {
                    error = "A student with the same data already exists."
                }, options, statusCode: 409);

            // Add the student
            dbContext.Students.Add(stud);
            await dbContext.SaveChangesAsync();

            var route = $"/student/{stud.StudentId}";
            return Results.Created(route, stud);
        }).WithName("AddStudentData");

        // ReSharper disable once InconsistentNaming
        // Create a route for PUT requests
        app.MapPut("/student/{studentID}", async (
            Students stud, string studentID
        ) => {
            var date = stud.PresentDate;
            stud.PresentDate = date.ToUniversalTime();

            // Set stud.studentID to studentID
            // from the route if the former is null.
            if (string.IsNullOrEmpty(stud.StudentId)) stud.StudentId = studentID;

            // Check if a student doesn't exist using the provided ID.
            var isExisting = dbContext.Students.Any(s => s.StudentId == studentID);

            if (!isExisting) {
                string[] msg = [
                    $"The student with the id, '{studentID}' does not exist.",
                    "Please create this new student using a POST request with this route:",
                    "/student"
                ];
                return Results.Json(new { error = msg }, options, statusCode: 404);
            }

            // ReSharper disable once MethodHasAsyncOverload
            // Update the student data
            dbContext.Students
                .Where(s => s.StudentId == studentID)
                .Update(s => new Students {
                    StudentId = stud.StudentId,
                    StudentName = string.IsNullOrEmpty(stud.StudentName) ? s.StudentName : stud.StudentName,
                    Course = string.IsNullOrEmpty(stud.Course) ? s.Course : stud.Course,
                    PresentDate = stud.PresentDate
                });
            await dbContext.SaveChangesAsync();

            var route = $"/student/{stud.StudentId}";
            return Results.Created(route, stud);
        }).WithName("UpdateStudentData");

        await app.RunAsync();
    }
}

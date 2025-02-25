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
        var isOpen = System.Data.ConnectionState.Open;
        if (dbContext.Database.GetDbConnection().State != isOpen)
            await dbContext.Database.OpenConnectionAsync();

        // Create a route for GET requests
        app.MapGet("/student", async () => {
            var students = await dbContext.Students.ToListAsync();

            var jsonOptions = new JsonSerializerOptions {
                WriteIndented = true
            };

            return Results.Json(students, jsonOptions);
        }).WithName("GetStudentData");

        app.MapPost("/student", async (Students student) => {
            var date = student.presentDate;
            student.presentDate = date.ToUniversalTime();

            // Check if the student already exists
            var existingStudent = await dbContext.Students
                .FirstOrDefaultAsync(s =>
                    s.presentDate == student.presentDate &&
                    s.studentID == student.studentID);

            if (existingStudent != null) {
                var data = new {
                    error = "A student with the same data already exists."
                };
                return Results.Json(data, statusCode: 409);
            }

            // Add the student
            dbContext.Students.Add(student);
            await dbContext.SaveChangesAsync();

            return Results.Created($"/student/{student.studentID}", student);
        }).WithName("SendStudentData");

        await app.RunAsync();
    }
}

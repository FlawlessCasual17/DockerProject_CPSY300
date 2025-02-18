using System.Text.Json;
using API.Database;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
namespace API;

public abstract class Program {
    public static async Task Main(string[] args) {
        var builder = WebApplication.CreateBuilder(args);

        // Add services to the container.
        // Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
        builder.Services.AddOpenApi();

        var app = builder.Build();

        // Configure the HTTP request pipeline.
        if (app.Environment.IsDevelopment()) app.MapOpenApi();

        app.UseHttpsRedirection();

        var dbService = new Service();
        await dbService.Initialize();

        // Create a route for GET requests
        app.MapGet("/student", async () => {
                var dbContext = dbService.GetDbContext();
                var students = await dbContext.Students.ToListAsync();
                var jsonOptions = new JsonSerializerOptions {
                    WriteIndented = true
                };
                return Results.Json(students, jsonOptions);
            }
        ).WithName("GetStudentData");

        app.MapPost("/student", async (Students student) => {
                var dbContext = dbService.GetDbContext();
                var date = student.presentDate;
                student.presentDate = date.ToUniversalTime();

                // Check if the database connection is open
                if (dbContext.Database.GetDbConnection().State != System.Data.ConnectionState.Open)
                    await dbContext.Database.OpenConnectionAsync();

                // Check if the table exists
                var command = dbContext.Database.GetDbConnection().CreateCommand();
                command.CommandText = "SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'students'";
                var result = await command.ExecuteScalarAsync();

                if (result == null)
                    return Results.Conflict(new StatusCodeResult(409));

                // Add the student
                dbContext.Students.Add(student);
                await dbContext.SaveChangesAsync();
                return Results.Created($"/student/{student.studentID}", student);
            }
        ).WithName("SendStudentData");

        await app.RunAsync();
    }
}

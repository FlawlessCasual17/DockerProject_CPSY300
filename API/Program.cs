using System.Text.Json;
using API.Database;
using Microsoft.EntityFrameworkCore;
namespace API;

public class Program {
    public static async Task Main(string[] args) {
        var builder = WebApplication.CreateBuilder(args);

        // Add services to the container.
        // Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
        builder.Services.AddOpenApi();

        var app = builder.Build();

        // Configure the HTTP request pipeline.
        if (app.Environment.IsDevelopment()) app.MapOpenApi();

        app.UseHttpsRedirection();

        var serv = new Service();
        await serv.Initialize();

        // Create a route for GET requests
        app.MapGet("/student", async () => {
                var dbContext = serv.GetDbContext();
                var students = await dbContext.Students.ToListAsync();
                var jsonOptions = new JsonSerializerOptions {
                    WriteIndented = true
                };
                return Results.Json(students, jsonOptions);
            }
        ).WithName("GetStudentData");

        // Create a route for POST requests
        app.MapPost("/student", async (Students students) => {
                var dbContext = serv.GetDbContext();
                dbContext.Students.Add(students);
                await dbContext.SaveChangesAsync();
                return Results.Created($"/student/{students.studentID}", students);
            }
        ).WithMetadata(
            new EndpointMetadataCollection(new RouteNameMetadata("CreateStudent"))
        );

        await app.RunAsync();
    }
}

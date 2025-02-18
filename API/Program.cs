using System.Text.Json;
using API.Database;
using Microsoft.EntityFrameworkCore;
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
        app.MapPost("/student", async (Students student) => {
                var dbContext = serv.GetDbContext();
                var date = student.presentDate;
                student.presentDate = date.ToUniversalTime();
                dbContext.Students.Add(student);
                await dbContext.SaveChangesAsync();
                return Results.Created($"/student/{student.studentID}", student);
            }
        ).WithMetadata(
            new EndpointMetadataCollection(new RouteNameMetadata("CreateStudent"))
        );

        await app.RunAsync();
    }
}

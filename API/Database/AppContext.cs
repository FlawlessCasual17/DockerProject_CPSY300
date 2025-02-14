using Microsoft.EntityFrameworkCore;
namespace API.Database;

public class AppContext(
    DbContextOptions<AppContext> options
) : DbContext(options) {
    // Define a property for each table
    public DbSet<Students> Students { get; set; }

    // NOTE:
    // No need to use `OnConfiguring()` here since
    // it's already defined in "Service.cs"

    protected override void OnModelCreating(ModelBuilder modelBuilder) {
        base.OnModelCreating(modelBuilder);

        // What does this do? It maps the `Students` class to the `students` table
        modelBuilder.Entity<Students>().ToTable("students");
    }
}

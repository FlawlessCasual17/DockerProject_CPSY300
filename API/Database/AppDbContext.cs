using Microsoft.EntityFrameworkCore;
namespace API.Database;

public class AppDbContext(
    DbContextOptions<AppDbContext> options
) : DbContext(options) {
    // Define a property for each table
    public DbSet<Students>? Students { get; set; }

    // NOTE:
    // No need to use `OnConfiguring()` here since
    // it's already defined in "Service.cs"

    protected override void OnModelCreating(ModelBuilder modelBuilder) {
        base.OnModelCreating(modelBuilder);

        // What does this do? It maps the `Students` class to the `students` table
        modelBuilder.Entity<Students>(student => {
            student.ToTable("students");
            student.HasKey(s => s.StudentId);
            student.Property(s => s.StudentName)
                .HasColumnName("student_name");
            student.Property(s => s.CourseName)
                .HasColumnName("course_name");
            student.Property(s => s.Date)
                .HasColumnName("date");
        });
    }
}

using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
namespace API.Database;

/// <summary>
/// A table model for mock (fake) student data.
/// </summary>
[Table("students")]
public class Students {
    [Key] [Column("student_id")]
    public int? StudentId { get; set; }

    [Required] [Column("student_name")]
    public required string? StudentName { get; set; }

    [Required] [Column("email")]
    public required string? Email { get; set; }

    [Required] [Column("course")]
    public required string? Course { get; set; }

    [Column("present_date")]
    public DateTime? PresentDate { get; set; }
}

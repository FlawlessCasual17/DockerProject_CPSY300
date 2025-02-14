using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
// ReSharper disable All
namespace API.Database;

/// <summary>
/// A table model for mock (fake) student data.
/// </summary>
[Table("students")]
public class Students {
    [Key] [Column("student_id")]
    public int studentID { get; set; }

    [MaxLength(100)]
    [Required] [Column("student_name")]
    public required string studentName { get; set; }

    [MaxLength(100)]
    [Required] [Column("course")]
    public required string course { get; set; }

    [Column("present_date")]
    public DateTime? presentDate { get; set; }
}

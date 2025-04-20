using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using API.Helpers;
namespace API.Database;

/// <summary>
/// A table model for mock (fake) student data.
/// </summary>
[Table("students")]
public class Students {
    [Key]
    [Required]
    [MaxLength(9)]
    [Column("student_id")]
    [JsonPropertyName("studentID")]
    public string? StudentId { get; set; }

    [MaxLength(100)]
    [Column("student_name")]
    [JsonPropertyName("studentName")]
    public string? StudentName { get; set; }

    [MaxLength(100)]
    [Column("course")]
    [JsonPropertyName("courseName")]
    public string? CourseName { get; set; }

    [Column("present_date")]
    [JsonPropertyName("Date")]
    [JsonConverter(typeof(DateOnlyConverter))]
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)]
    public DateOnly Date { get; set; } = DateOnly.MinValue;
}

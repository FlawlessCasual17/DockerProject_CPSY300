using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
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
    public string? Course { get; set; }

    [Column("present_date")]
    [JsonPropertyName("Date")]
    [JsonConverter(typeof(DateTimeConverter))]
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)]
    public DateTime PresentDate { get; set; } = DateTime.MinValue;
}

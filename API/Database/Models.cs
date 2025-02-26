using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Globalization;
using System.Text.Json;
using System.Text.Json.Serialization;
namespace API.Database;

/// <summary>
/// A table model for mock (fake) student data.
/// </summary>
[Table("students")]
public class Students {
    [Key]
    [MaxLength(9)]
    [Required] [Column("student_id")]
    [JsonPropertyName("studentID")]
    public string? StudentId { get; set; }

    [MaxLength(100)]
    [Column("student_name")]
    [JsonPropertyName("studentName")]
    public string? StudentName { get; set; }

    [MaxLength(100)]
    [Column("course")]
    [JsonPropertyName("course")]
    public string? Course { get; set; }

    [Column("present_date")]
    [JsonPropertyName("presentDate")]
    [JsonConverter(typeof(DateTimeConverter))]
    public DateTime PresentDate { get; set; }
}

/// <summary>
/// A custom JSON converter for handling JSON null values.
/// </summary>
class DateTimeConverter : JsonConverter<DateTime> {
    public override DateTime Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options) {
        var isTokenTypeNull = reader.TokenType == JsonTokenType.Null;
        var isNullOrEmpty = reader.TokenType == JsonTokenType.String && string.IsNullOrEmpty(reader.GetString());
        return !(isTokenTypeNull || isNullOrEmpty) ?
            DateTime.Parse(reader.GetString() ?? "0000-00-00") : DateTime.MinValue;
    }

    public override void Write(Utf8JsonWriter writer, DateTime value, JsonSerializerOptions options)
        => writer.WriteStringValue(value.ToString(CultureInfo.CurrentCulture));
}

using System.Globalization;
using System.Text.Json;
using System.Text.Json.Serialization;
namespace API.Helpers;

/// <summary>
/// Custom JSON converter for DateOnly.
/// </summary>
public class DateOnlyConverter : JsonConverter<DateOnly> {
    static readonly string[] FORMATS = {
        "dd/MM/yyyy",
        "MM/dd/yyyy",
        "yyyy/MM/dd",
        "dd-MM-yyyy",
        "MM-dd-yyyy",
        "yyyy-MM-dd"
        // Add any other formats you want to support
    };

    public override DateOnly Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options) {
        var dateString = reader.GetString();

        if (string.IsNullOrEmpty(dateString)) return DateOnly.MinValue;

        return DateOnly.TryParseExact(
            dateString,
            FORMATS,
            CultureInfo.InvariantCulture,
            DateTimeStyles.None,
            out var date
        ) ? date : DateOnly.Parse(dateString);
    }

    public override void Write(Utf8JsonWriter writer, DateOnly value, JsonSerializerOptions options)
        => writer.WriteStringValue(value.ToString("yyyy-MM-dd"));
}

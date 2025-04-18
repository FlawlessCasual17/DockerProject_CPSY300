using System.Globalization;
using System.Text.Json;
using System.Text.Json.Serialization;

/// <summary>
/// Custom JSON converter for DateTime.
/// </summary>
public class DateTimeConverter : JsonConverter<DateTime> {
    static readonly string[] DateTimeFormats = {
        "dd/MM/yyyy",
        "MM/dd/yyyy",
        "yyyy-MM-dd"
        // Add any other formats you want to support
    };

    public override DateTime Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options) {
        var dateString = reader.GetString();

        if (string.IsNullOrEmpty(dateString)) return DateTime.MinValue;

        if (DateTime.TryParseExact(
            dateString,
            DateTimeFormats,
            CultureInfo.InvariantCulture,
            DateTimeStyles.None,
            out DateTime date
        ))
            return date;

        return DateTime.Parse(dateString);
    }

    public override void Write(Utf8JsonWriter writer, DateTime value, JsonSerializerOptions options) {
        writer.WriteStringValue(value.ToString("yyyy-MM-dd"));
    }
}

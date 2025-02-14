using dotenv.net;
using Microsoft.EntityFrameworkCore;
namespace API.Database;

public class Service {
    AppContext? dbContext;

    /// <summary>
    /// Initializes the database.
    /// </summary>
    /// <exception cref="Exception">
    /// Occurs when the database cannot be initialized.
    /// </exception>
    public async Task Initialize() {
        try {
            // Load from ".env"
            DotEnv.Load();

            // Build a new configuration
            var config = new ConfigurationBuilder()
                .SetBasePath(Directory.GetCurrentDirectory())
                .AddEnvironmentVariables()
                .Build();

            // Get the connection string from the configuration
            var connString = config.GetConnectionString("DefaultConnection");

            // Create a new connection
            var options = new DbContextOptionsBuilder<AppContext>()
                .UseNpgsql(connString).Options;

            // Initialize the database context
            dbContext = new AppContext(options);

            // Create the database and ensure it exists
            await dbContext.Database.EnsureCreatedAsync();
        } catch (Exception ex) {
            // If all else fails, throw an exception
            throw new Exception(ex.Message);
        }
    }

    /// <summary>
    /// Returns the database context.
    /// </summary>
    /// <returns>The database context.</returns>
    /// <exception cref="Exception">
    /// Occurs when the database has not been initialized.
    /// </exception>
    public AppContext GetDbContext()
        => dbContext ?? throw new Exception("The Database has not been initialized.");
}

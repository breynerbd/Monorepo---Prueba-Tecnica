using AuthService.Api.Extensions;
using AuthService.Api.Middlewares;
using AuthService.Api.ModelBinders;
using AuthService.Persistence.Data;
using Microsoft.EntityFrameworkCore;
using NetEscapades.AspNetCore.SecurityHeaders.Infrastructure;
using Serilog;


var builder = WebApplication.CreateBuilder(args);


// =========================
// CONFIGURACIÓN GENERAL
// =========================

System.Net.ServicePointManager.ServerCertificateValidationCallback +=
    (sender, certificate, chain, sslPolicyErrors) => true;


builder.Host.UseSerilog((context, services, loggerConfiguration) =>
    loggerConfiguration
        .ReadFrom.Configuration(context.Configuration)
        .ReadFrom.Services(services));


// =========================
// CONTROLLERS
// =========================

builder.Services.AddControllers(options =>
{
    options.ModelBinderProviders.Insert(
        0,
        new FileDataModelBinderProvider()
    );

})
.AddJsonOptions(options =>
{
    options.JsonSerializerOptions.PropertyNamingPolicy =
        System.Text.Json.JsonNamingPolicy.CamelCase;
});


// =========================
// SERVICES
// =========================

builder.Services.AddApiDocumentation();

builder.Services.AddApplicationServices(
    builder.Configuration
);

builder.Services.AddJwtAuthentication(
    builder.Configuration
);

builder.Services.AddRateLimitingPolicies();

builder.Services.AddSecurityPolicies(
    builder.Configuration
);

builder.Services.AddSecurityOptions();


builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();



Console.WriteLine("ANTES DEL BUILD");

var app = builder.Build();

Console.WriteLine("DESPUES DEL BUILD");


// =========================
// MIDDLEWARES
// =========================

app.UseSerilogRequestLogging();


app.UseMiddleware<GlobalExceptionMiddleware>();


app.UseHttpsRedirection();

app.UseCors("DefaultCorsPolicy");

app.UseRateLimiter();

app.UseAuthentication();

app.UseAuthorization();



app.MapControllers();



// =========================
// HEALTH CHECKS
// =========================

app.MapGet("/health", () =>
{
    return Results.Ok(new
    {
        status = "Healthy",
        timestamp = DateTime.UtcNow
    });
});


app.MapHealthChecks("/api/v1/health");


// =========================
// DATABASE INITIALIZATION
// =========================

using(var scope = app.Services.CreateScope())
{
    var context =
        scope.ServiceProvider
        .GetRequiredService<ApplicationDbContext>();

    var logger =
        scope.ServiceProvider
        .GetRequiredService<ILogger<Program>>();

    try
    {
        logger.LogInformation("Connecting PostgreSQL...");

        var connected =
            await context.Database.CanConnectAsync();

        if(!connected)
        {
            throw new Exception(
                "PostgreSQL connection failed"
            );
        }

        logger.LogInformation(
            "PostgreSQL connected"
        );

        await context.Database.MigrateAsync();

        logger.LogInformation(
            "Database migrations completed"
        );

        await DataSeeder.SeedAsync(context);

        logger.LogInformation(
            "Database seed completed"
        );
    }
    catch(Exception ex)
    {
        logger.LogError(
            ex,
            "Database initialization failed"
        );

        throw;
    }
}


app.Run();
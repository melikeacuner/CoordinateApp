using CoordinateApp;
using CoordinateApp.Context;
using CoordinateApp.Repositories.Abstract;
using CoordinateApp.Repositories.Concrete;
using CoordinateApp.Services.Abstract;
using CoordinateApp.Services.Concrete;
using Microsoft.EntityFrameworkCore;
using Npgsql;

internal class Program
{
    public static void Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);


        builder.Services.AddControllers();
        builder.Services.AddEndpointsApiExplorer();
        builder.Services.AddSwaggerGen();
        builder.Services.AddAutoMapper(typeof(DtoMapper).Assembly);

        builder.Configuration.AddJsonFile("appsettings.json", optional: true, reloadOnChange: true);


        builder.Services.AddDbContext<CoordinateDbContext>(options =>
            options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"),
                              npgsqlOptions => npgsqlOptions.UseNetTopologySuite()));


        builder.Services.AddScoped<ICoordinateService, CoordinateService>();
        builder.Services.AddScoped<ICoordinateRepository, CoordinateRepository>();
        builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();

        // CORS policy configuration
        builder.Services.AddCors(options =>
        {
            options.AddPolicy("CorsPolicy",
                builder => builder
                    .AllowAnyOrigin() // Tüm kaynaklardan isteklere izin verir (Geliþtirme amaçlý)
                    .AllowAnyMethod()
                    .AllowAnyHeader());
        });

        var app = builder.Build();

        // Configure the HTTP request pipeline.
        if (app.Environment.IsDevelopment())
        {
            app.UseSwagger();
            app.UseSwaggerUI();
        }

        app.UseHttpsRedirection();

        app.UseAuthorization();

        app.UseCors("CorsPolicy");

        app.MapControllers();

        using (var scope = app.Services.CreateScope())
        {
            var services = scope.ServiceProvider;
            var context = services.GetRequiredService<CoordinateDbContext>();
            context.Database.Migrate();
        }

        app.Run();
    }
}
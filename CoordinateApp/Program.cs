using CoordinateApp;
using CoordinateApp.DataAccess;
using CoordinateApp.Repositories.Abstract;
using CoordinateApp.Repositories.Concrete;
using CoordinateApp.Services.Abstract;
using CoordinateApp.Services.Concrete;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddAutoMapper(typeof(DtoMapper).Assembly);

builder.Configuration.AddJsonFile("appsettings.json", optional: true, reloadOnChange: true);

builder.Services.AddDbContext<CoordinatesDbContext>(Options =>
{
    Options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"));
});

builder.Services.AddScoped<ICoordinateService, CoordinateService>();
builder.Services.AddScoped<ICoordinateRepository, CoordinateRepository>();
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();

// CORS policy configuration
builder.Services.AddCors(options =>
{
    options.AddPolicy("CorsPolicy",
        builder => builder
            .AllowAnyOrigin() // T�m kaynaklardan isteklere izin verir (Geli�tirme ama�l�)
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

app.Run();


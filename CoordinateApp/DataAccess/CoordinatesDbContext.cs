using CoordinateApp.Models;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;

namespace CoordinateApp.DataAccess;
public class CoordinatesDbContext : DbContext
{
    public DbSet<Coordinate> coordinates { get; set; }
    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        optionsBuilder.UseNpgsql("Server=localhost;Port=5432;Database=CoordinateDb;UserId=postgres;Password=admin;");
        base.OnConfiguring(optionsBuilder);
    }
    
}

using CoordinateApp.Entity;
using Microsoft.EntityFrameworkCore;

namespace CoordinateApp.DataAccess;
public class CoordinatesDbContext : DbContext
{
    public DbSet<Coordinate> Coordinates { get; set; }
   
    public CoordinatesDbContext(DbContextOptions<CoordinatesDbContext> options)
        : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Coordinate>()
            .Property(e => e.Id)
            .HasDefaultValueSql("uuid_generate_v4()");
    }


    #region Farkli Yontem
    //protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    //{
    //    optionsBuilder.UseNpgsql("Server=localhost;Port=5432;Database=CoordinateDb;UserId=postgres;Password=admin;");
    //    base.OnConfiguring(optionsBuilder);
    //} 
    #endregion

}

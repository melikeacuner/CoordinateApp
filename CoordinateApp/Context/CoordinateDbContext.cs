using Microsoft.EntityFrameworkCore;
using NetTopologySuite.Geometries;
using Npgsql.EntityFrameworkCore.PostgreSQL.NetTopologySuite;

namespace CoordinateApp.Context
{
    public partial class CoordinateDbContext : DbContext
    {
        public CoordinateDbContext(DbContextOptions<CoordinateDbContext> options)
            : base(options)
        {
        }

        public DbSet<Entity.Coordinates> Coordinates { get; set; }

    
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
   

            modelBuilder.Entity<Entity.Coordinates>(entity =>
            {
                entity.ToTable("Coordinates");

                entity.Property(e => e.Id).HasColumnName("Id").HasColumnType("uuid");
                entity.Property(e => e.Name).HasColumnName("Name").HasColumnType("character varying");
                entity.Property(e => e.Geo).HasColumnName("Geo").HasColumnType("geometry");
            });

           
        }
    }
}

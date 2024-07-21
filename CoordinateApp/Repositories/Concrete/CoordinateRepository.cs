using CoordinateApp.Context;
using CoordinateApp.Entity;
using CoordinateApp.Repositories.Abstract;
using Microsoft.EntityFrameworkCore;

namespace CoordinateApp.Repositories.Concrete;

public class CoordinateRepository : GenericRepository<Coordinates>, ICoordinateRepository
{
    private readonly CoordinateDbContext _db;
    public CoordinateRepository(CoordinateDbContext db) : base(db)
    {
        _db = db;
    }

    #region CRUD Disindaki
    //public List<Coordinate> GetListCoordinatesWhereYIsBiggerThanFive()
    //{
    //    return _db.Coordinates
    //         .Where(x => x.Y > 5)
    //         .ToList();
    //} 
    #endregion
}

using CoordinateApp.DataAccess;
using CoordinateApp.Models;
using CoordinateApp.Repositories.Abstract;

namespace CoordinateApp.Repositories.Concrete;

public class CoordinateRepository : GenericRepository<Coordinate>, ICoordinateRepository
{
    private readonly CoordinatesDbContext _db;
    public CoordinateRepository(CoordinatesDbContext db) : base(db)
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

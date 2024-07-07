using CoordinateApp.DataAccess;
using CoordinateApp.Models;
using CoordinateApp.Repositories.Abstract;

namespace CoordinateApp.Repositories.Concrete;

public class CoordinateRepository : ICoordinateRepository
{
    private readonly CoordinatesDbContext _db;
    public CoordinateRepository(CoordinatesDbContext db)
    {
        _db = db;
    }
    public bool Add(Coordinate coordinate)
    {
        _db.Coordinates.Add(coordinate);
        return _db.SaveChanges() > 0;
    }

    public bool Delete(Guid id)
    {
        var cooordinateToBeDeleted = _db.Coordinates.FirstOrDefault(x => x.Id == id);
        if (cooordinateToBeDeleted == null)
        {
            return false;
        }
        _db.Coordinates.Remove(cooordinateToBeDeleted);
        return _db.SaveChanges() > 0;
    }

    public List<Coordinate> GetAll()
    {
       return _db.Coordinates.ToList();
    }

    public Coordinate? GetById(Guid id)
    {
        return _db.Coordinates.FirstOrDefault(x => x.Id == id);
    }

    public bool Update(Coordinate coordinate)
    {
        var cooordinateToBeUpdated = _db.Coordinates.FirstOrDefault(x => x.Id == coordinate.Id);
        if (cooordinateToBeUpdated == null)
        {
            return false;
        }

        _db.Entry(cooordinateToBeUpdated).CurrentValues.SetValues(coordinate);

        return _db.SaveChanges() > 0;
    }

}

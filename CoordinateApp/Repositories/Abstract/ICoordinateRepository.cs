using CoordinateApp.Entity.Dto;
using CoordinateApp.Models;

namespace CoordinateApp.Repositories.Abstract;

public interface ICoordinateRepository
{
    public List<Coordinate> GetAll();
    public Coordinate? GetById(Guid id);
    public bool Add(Coordinate coordinate);
    public bool Update(Coordinate coordinate);
    public bool Delete(Guid id);
}

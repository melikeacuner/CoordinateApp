using CoordinateApp.Models;

namespace CoordinateApp.Repositories.Abstract;

public interface ICoordinateRepository : IGenericRepository<Coordinate>
{
	#region crud dışı
	//public List<Coordinate> GetListCoordinatesWhereYIsBiggerThanFive(); 
	#endregion
}

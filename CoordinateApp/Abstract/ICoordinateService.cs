using CoordinateApp;
using CoordinateApp.Models;

namespace CoordinateApp.Abstract
{
    public interface ICoordinateService
    {
        public Response GetAll();
        public Response GetById(int id);
        public Response Add(Coordinate coordinate);
        public Response Update(Coordinate coordinate);
        public Response Delete(int id);
    }
}

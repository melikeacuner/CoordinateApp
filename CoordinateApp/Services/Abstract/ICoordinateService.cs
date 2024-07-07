using CoordinateApp.Entity.Dto;
using CoordinateApp.Models;

namespace CoordinateApp.Services.Abstract
{
    public interface ICoordinateService
    {
        public Response GetAll();
        public Response GetById(Guid id);
        public Response Add(Coordinate coordinate);
        public Response Update(Coordinate coordinate);
        public Response Delete(Guid id);
    }
}

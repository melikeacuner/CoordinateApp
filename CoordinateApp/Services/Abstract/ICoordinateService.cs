using CoordinateApp.Entity;
using CoordinateApp.Entity.Dto;

namespace CoordinateApp.Services.Abstract
{
    public interface ICoordinateService
    {
        public Response GetAll();
        public Response GetById(Guid id);
        public Response Add(CoordinatesAddDto coordinatesAddDto);
        public Response Update(CoordinatesDto korFromReq); 
        public Response Delete(Guid id);
    }
}

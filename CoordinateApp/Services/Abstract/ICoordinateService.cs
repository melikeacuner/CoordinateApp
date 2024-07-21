using CoordinateApp.Entity.Dto;

namespace CoordinateApp.Services.Abstract
{
    public interface ICoordinateService
    {
        public Response GetAll();
        public Response GetById(Guid id);
        public Response Add(CoordinatesAddDto coordinatesAddDto);
        public Response Update(CoordinatesDto coordinatesUpdateDto);
        public Response Delete(Guid id);
    }
}

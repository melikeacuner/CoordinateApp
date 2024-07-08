using CoordinateApp.Entity;
using CoordinateApp.Entity.Dto;

namespace CoordinateApp.Services.Abstract
{
    public interface ICoordinateService
    {
        public Response GetAll();
        public Response GetById(Guid id);
        public Response Add(CoordinateAddDto coordinateAddDto);
        public Response Update(CoordinateUpdateDto coordinateUpdateDto); 
        public Response Delete(Guid id);
    }
}

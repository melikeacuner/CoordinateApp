using AutoMapper;
using CoordinateApp.Entity.Dto;
using CoordinateApp.Entity;

namespace CoordinateApp
{
    public class DtoMapper : Profile
    {
        public DtoMapper()
        {
            CreateMap<Coordinate, CoordinateAddDto>().ReverseMap();
            CreateMap<Coordinate, CoordinateUpdateDto>().ReverseMap();
        }
    }
}

using AutoMapper;
using CoordinateApp.Entity.Dto;
using CoordinateApp.Models;

namespace CoordinateApp
{
    public class DtoMapper : Profile
    {
        public DtoMapper()
        {
            CreateMap<Coordinate, CoordinateAddDto>();
            CreateMap<CoordinateAddDto, Coordinate>();
        }
    }
}

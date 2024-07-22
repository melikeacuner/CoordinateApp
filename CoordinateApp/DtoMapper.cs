using AutoMapper;
using NetTopologySuite.Geometries;
using NetTopologySuite.IO;
using CoordinateApp.Entity.Dto;

namespace CoordinateApp
{
    public class DtoMapper : Profile
    {
        public DtoMapper()
        {
            CreateMap<Entity.Coordinates, CoordinatesDto>()
                .ForMember(dest => dest.Wkt, opt => opt.MapFrom(src => ConvertToWkt(src.Geo)))
                .ReverseMap()
                .ForMember(dest => dest.Geo, opt => opt.MapFrom(src => ParseWkt(src.Wkt)));

            CreateMap<CoordinatesAddDto, Entity.Coordinates>()
                .ForMember(dest => dest.Geo, opt => opt.MapFrom(src => ParseWkt(src.Wkt)));
        }

        private static Geometry ParseWkt(string wkt)
        {
            if (string.IsNullOrEmpty(wkt))
                return null;

            var reader = new WKTReader();
            return reader.Read(wkt);
        }

        private static string ConvertToWkt(Geometry geometry)
        {
            if (geometry == null)
                return null;

            var writer = new WKTWriter();
            return writer.Write(geometry);
        }
    }
}

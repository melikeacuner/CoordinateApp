using CoordinateApp.DataAccess;
using NetTopologySuite.Geometries;

namespace CoordinateApp.Entity;

public partial class Coordinates : BaseEntity
{
    public Geometry Geo { get; set; } = null!;

    public string Name { get; set; } = null!;
}


using System.ComponentModel.DataAnnotations;

namespace CoordinateApp.Models
{
    public class Coordinate
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();
        public int X { get; set; }
        public int Y { get; set; }
        public string Name { get; set; }
    }
}

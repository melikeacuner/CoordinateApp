using CoordinateApp.Models;
using CoordinateApp;
using CoordinateApp.Abstract;
using CoordinateApp.Concrete;
using Microsoft.AspNetCore.Mvc;

namespace CoordinateApp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CoordinateController : ControllerBase //test
    {
        private static readonly List<Coordinate> CoordinateList = new List<Coordinate>();
        private static readonly ICoordinateService _coordinateService = new CoordinateService("Server=localhost;Port=5432;Database=CoordinateDb;UserId=postgres;Password=admin;");

        [HttpGet]
        public Response GetAll()
        {
            return _coordinateService.GetAll();
        }

        [HttpGet("{id}")]
        public Response GetById(int id)
        {
            return _coordinateService.GetById(id);
        }

        [HttpPost]
        public Response Add([FromBody] Coordinate k)
        {
            return _coordinateService.Add(k);
        }

        [HttpPut]
        public Response Update([FromBody] Coordinate korFromReq)
        {
            return _coordinateService.Update(korFromReq);
        }

        [HttpDelete("{id}")]
        public Response Delete(int id)
        {
            return _coordinateService.Delete(id);
        }
    }
}

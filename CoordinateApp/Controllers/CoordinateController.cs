using CoordinateApp.Entity.Dto;
using CoordinateApp.Services.Abstract;
using Microsoft.AspNetCore.Mvc;

namespace CoordinateApp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CoordinateController : ControllerBase
    {
        private readonly ICoordinateService _coordinateService;
        public CoordinateController(ICoordinateService service)
        {
            _coordinateService = service;
        }

        [HttpGet]
        public Response GetAll()
        {
            return _coordinateService.GetAll();
        }

        [HttpGet("{id}")]
        public Response GetById(Guid id)
        {
            return _coordinateService.GetById(id);
        }

        [HttpPost]
        public Response Add([FromBody] CoordinateAddDto coordinateAddDto)
        {
            return _coordinateService.Add(coordinateAddDto);
        }

        [HttpPut]
        public Response Update([FromBody] CoordinateUpdateDto korFromReq)
        {
            return _coordinateService.Update(korFromReq);
        }

        [HttpDelete("{id}")]
        public Response Delete(Guid id)
        {
            return _coordinateService.Delete(id);
        }
    }
}

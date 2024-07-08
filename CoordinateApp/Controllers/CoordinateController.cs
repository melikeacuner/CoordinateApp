using AutoMapper;
using CoordinateApp.Entity.Dto;
using CoordinateApp.Models;
using CoordinateApp.Services.Abstract;
using Microsoft.AspNetCore.Mvc;

namespace CoordinateApp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CoordinateController : ControllerBase
    {
        private readonly ICoordinateService _coordinateService;
        private readonly IMapper _mapper;
        public CoordinateController(ICoordinateService service, IMapper mapper)
        {
            _coordinateService = service;
            _mapper = mapper;
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
        public Response Add([FromBody] CoordinateAddDto CoordinateAddDto)
        {
            Coordinate coordinate = _mapper.Map<Coordinate>(CoordinateAddDto);
            return _coordinateService.Add(coordinate);
        }

        [HttpPut]
        public Response Update([FromBody] Coordinate korFromReq)
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

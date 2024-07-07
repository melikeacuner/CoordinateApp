namespace CoordinateApp.Repositories.Abstract
{
    public interface IGenericRepository<T> where T : class
    {
        public List<T> GetAll();
        public T? GetById(Guid id);
        public bool Add(T entity);
        public bool Update(T entity);
        public bool Delete(Guid id);
    }
}

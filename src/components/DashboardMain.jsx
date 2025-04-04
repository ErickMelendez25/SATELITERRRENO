import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom';
import "../styles/DashboardTerrenos.css";

const DashboardMain = () => {
  const [usuarios, setUsuarios] = useState([]);


  const [editMode, setEditMode] = useState(false);

  const [usuarioLocal, setUsuarioLocal] = useState(null);
  const apiUrl = process.env.NODE_ENV === 'production' 
  ? 'https://sateliterrreno-production.up.railway.app' 
  : 'http://localhost:5000';

  // Obtener elementos necesarios

  const [sidebarActive, setSidebarActive] = useState(false);  

  const changeCategory = (newCategory) => {
    navigate(`/dashboard/${newCategory}`);  // Navega usando `navigate`
    setSidebarActive(false); // Cierra la barra lateral cuando se selecciona una categoría
  };
 




  const { categoria } = useParams();
  const navigate = useNavigate();

  const [terrenos, setTerrenos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    precioMin: 0,
    precioMax: 10000000,
    estado: 'todos',
    ubicacion: '',
    search: '',
    moneda: 'soles',
  });
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    tipoDocumento: 'DNI',
    numeroDocumento: '',
    emisionDocumento: '',
    celular: '',
    email: '',
    consentimiento: false,
  });



  // Obtener los usuarios desde la API
  useEffect(() => {
    // Establecer la URL de la API según el entorno (producción o desarrollo)
    const apiUrl = process.env.NODE_ENV === 'production'
      ? 'https://sateliterrreno-production.up.railway.app'
      : 'http://localhost:5000';
  
    // Obtener el token desde localStorage para incluirlo en el encabezado de autorización
    const token = localStorage.getItem('authToken'); 
    console.log("Token obtenido: ", token); // Verificar que el token esté siendo correctamente extraído
  
    // Hacer la solicitud para obtener los usuarios si el token está presente
    if (token) {
      axios.get(`${apiUrl}/api/usuarios`, {
        headers: {
          Authorization: `Bearer ${token}`, // Incluir el token en el encabezado
        },
      })
        .then((response) => {
          console.log("Respuesta de la API para usuarios:", response); // Verificar la respuesta completa de la API
          // Verificar si la respuesta es un array antes de establecer el estado
          const usuariosData = Array.isArray(response.data) ? response.data : [];
          console.log("Usuarios obtenidos:", usuariosData); // Verificar los usuarios obtenidos
          setUsuarios(usuariosData); // Establecer los usuarios en el estado
        })
        .catch((error) => {
          console.error('Error al obtener usuarios:', error); // Mostrar el error si ocurre
          setUsuarios([]); // Asegurarse de que los usuarios sean un array vacío en caso de error
        });
    } else {
      console.log('No se encontró el token, no se puede obtener los usuarios.');
      setUsuarios([]); // Limpiar el estado de usuarios si no se encuentra el token
    }
  
  }, []); // Este efecto solo se ejecuta una vez al cargar el componente

  // Obtener el usuario desde localStorage y sincronizar con los usuarios de la API
// Obtener el usuario desde localStorage y sincronizar con los usuarios de la API
useEffect(() => {
  const usuario = JSON.parse(localStorage.getItem('usuario'));

  console.log("Usuario obtenido desde localStorage:", usuario); // Verifica que el usuario esté en localStorage

  if (usuario) {
    setUsuarioLocal(usuario);

    // Verificar que usuarios están cargados antes de hacer la búsqueda
    if (usuarios.length > 0) {
      console.log("Usuarios cargados desde la API:", usuarios);

      // Buscar el usuario en la lista de usuarios de la API usando id_estudiante
      const usuarioAPI = usuarios.find(user => user.id === usuario.id_estudiante); // Compara con id_estudiante

      if (usuarioAPI) {
        console.log('Tipo de usuario desde la API:', usuarioAPI.tipo); // Verifica el tipo del usuario
      } else {
        console.log('Usuario no encontrado en la API');
      }
    } else {
      console.log("Aún no se han cargado los usuarios desde la API.");
    }
  } else {
    console.log("No hay usuario en localStorage.");
  }
}, [usuarios]); // Este useEffect se ejecuta cuando `usuarios` cambia

  



  // Obtener terrenos desde la API basados en la categoría
  useEffect(() => {
    const apiUrl = process.env.NODE_ENV === 'production'
      ? 'https://sateliterrreno-production.up.railway.app'
      : 'http://localhost:5000';

    if (categoria === 'terrenos') {
      const token = localStorage.getItem('authToken');

      console.log("Token obtenido: ", token); // Verifica si el token está siendo correctamente extraído

      axios.get(`${apiUrl}/api/terrenos`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        console.log("Respuesta de la API:", response); // Verifica la respuesta completa de la API
        // Verifica si la respuesta es un array antes de establecer el estado
        const terrenosData = Array.isArray(response.data) ? response.data : [];
        console.log("Terrenos obtenidos:", terrenosData); // Verifica los terrenos obtenidos
        setTerrenos(terrenosData);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error al obtener terrenos:', error); // Muestra el error si ocurre
        setTerrenos([]); // Asegúrate de que los terrenos sean un array vacío en caso de error
        setLoading(false);
      });
    } else {
      console.log("Categoría no es terrenos, limpiando terrenos...");
      setTerrenos([]); // Limpiar si no es la categoría 'terrenos'
      setLoading(false);
    }
  }, [categoria]);

  
  

  const getUsuarioDetails = (usuarioId) => {
    const usuario = usuarios.find(user => user.id === usuarioId);
    return usuario ? usuario.nombre : 'Usuario no encontrado';
  };

  const filteredTerrenos = terrenos.filter(terreno => {
    const precioValido = terreno.precio >= filters.precioMin && terreno.precio <= filters.precioMax;
    const estadoValido = filters.estado === 'todos' || terreno.estado === filters.estado;
    const ubicacionValida = terreno.ubicacion_lat && terreno.ubicacion_lon && (
      terreno.ubicacion_lat.toString().includes(filters.ubicacion) || terreno.ubicacion_lon.toString().includes(filters.ubicacion)
    );
    const searchValido = (terreno.titulo && (terreno.titulo.toLowerCase().includes(filters.search.toLowerCase()) || terreno.descripcion.toLowerCase().includes(filters.search.toLowerCase())));

    return precioValido && estadoValido && ubicacionValida && searchValido;
  });

  const sortedTerrenos = filteredTerrenos.sort((a, b) => new Date(b.fecha_publicacion) - new Date(a.fecha_publicacion));



  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Datos del formulario:', formData);
  };

  const handleCreateTerreno = async (e) => {
    e.preventDefault();
  
    if (!usuarioLocal || !usuarioLocal.id) {
      console.error('No se encontró el ID del usuario.');
      return;
    }
  
    const newTerreno = {
      titulo: formData.titulo,
      descripcion: formData.descripcion,
      precio: formData.precio,
      ubicacion_lat: formData.ubicacion_lat,
      ubicacion_lon: formData.ubicacion_lon,
      metros_cuadrados: formData.metros_cuadrados,
      imagenes: JSON.stringify([formData.imagenes]),
      estado: formData.estado,
      usuario_id: usuarioLocal.id,
    };
  
    console.log('Datos enviados al servidor:', newTerreno);
  
    try {
      const response = await fetch('http://localhost:5000/api/Createterrenos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTerreno),
      });
  
      if (!response.ok) {
        const errorMessage = await response.text();
        console.error('Error al crear el terreno:', errorMessage);
        throw new Error(errorMessage);
      }
  
      const data = await response.json();
      console.log('Terreno creado exitosamente:', data);
  
      // Limpiar el formulario
      setFormData({
        titulo: '',
        descripcion: '',
        precio: '',
        ubicacion_lat: '',
        ubicacion_lon: '',
        metros_cuadrados: '',
        imagenes: '',
        estado: 'disponible',
      });
  
      // Cerrar el formulario (ocultar el formulario)
      setShowForm(false);
  
      // Actualizar la lista de terrenos después de crear un nuevo terreno
      axios.get(`${apiUrl}/api/terrenos`)
        .then((response) => {
          setTerrenos(response.data);
        })
        .catch((error) => {
          console.error('Error al obtener terrenos después de la creación:', error);
        });
  
    } catch (error) {
      console.error('Error en la creación del terreno:', error);
    }
  };
  
  
  
  


  const renderCompradorView = () => (
    <div className="dashboard">
      <button
        className="sidebar-toggle"
        onClick={() => setSidebarActive(!sidebarActive)} // Cambiar el estado de la barra lateral
      >
        ☰
      </button>
      <div className={`sidebar ${sidebarActive ? 'active' : ''}`}>
        <div className="categories">
          <button
            className={`category-btn ${categoria === 'terrenos' ? 'active' : ''}`}
            onClick={() => { changeCategory('terrenos'); }}
          >
            Terrenos
          </button>
          <button
            className={`category-btn ${categoria === 'carros' ? 'active' : ''}`}
            onClick={() => { changeCategory('carros'); }}
          >
            Carros
          </button>
          <button
            className={`category-btn ${categoria === 'casas' ? 'active' : ''}`}
            onClick={() => { changeCategory('casas'); }}
          >
            Casas
          </button>
        </div>
        <button
          className="sell-button"
          onClick={() => {
            setShowForm(true);
            navigate('/dashboard/vender');
          }}
        >
          ¿Quieres vender?
        </button>
      </div>

      <div className="main-content">
        {categoria === undefined || categoria === '' ? (
          <div className="welcome-message">
            <h2>Nuestro sitio oficial</h2>
            <p>Bienvenido a nuestro sitio oficial. Aquí puedes encontrar diversos terrenos, casas, y carros a la venta. Si deseas vender, puedes utilizar nuestro formulario de conformidad.</p>
            <p>Explora las categorías disponibles y encuentra lo que necesitas.</p>
          </div>
        ) : showForm ? (
          <div className="sell-form-container">
            <form className="sell-form" onSubmit={handleSubmit}>
              <h3>Formulario de Conformidad</h3>

              <label htmlFor="tipoDocumento">Tipo de Documento:</label>
              <select
                id="tipoDocumento"
                value={formData.tipoDocumento}
                onChange={(e) => setFormData({ ...formData, tipoDocumento: e.target.value })}
              >
                <option value="DNI">DNI</option>
                <option value="RUC">RUC</option>
                <option value="Carnet Extranjero">Carnet Extranjero</option>
              </select>

              <label htmlFor="numeroDocumento">Número de Documento:</label>
              <input
                type="text"
                id="numeroDocumento"
                placeholder={`Ingrese su ${formData.tipoDocumento}`}
                value={formData.numeroDocumento}
                onChange={(e) => setFormData({ ...formData, numeroDocumento: e.target.value })}
                required
              />

              <label htmlFor="emisionDocumento">Emisión de Documento:</label>
              <input
                type="text"
                id="emisionDocumento"
                placeholder="Ingrese la fecha de emisión"
                value={formData.emisionDocumento}
                onChange={(e) => setFormData({ ...formData, emisionDocumento: e.target.value })}
                required
              />

              <label htmlFor="celular">Celular:</label>
              <input
                type="text"
                id="celular"
                placeholder="Ingrese su número de celular"
                value={formData.celular}
                onChange={(e) => setFormData({ ...formData, celular: e.target.value })}
                required
              />

              <label htmlFor="email">Correo Electrónico:</label>
              <input
                type="email"
                id="email"
                placeholder="Correo Electrónico"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />

              <label htmlFor="consentimiento">
                <input
                  type="checkbox"
                  id="consentimiento"
                  checked={formData.consentimiento}
                  onChange={(e) => setFormData({ ...formData, consentimiento: e.target.checked })}
                  required
                />
                Acepto que mis datos serán utilizados para formalizar todo tipo de venta.
              </label>

              <button type="submit" className="sell-form-submit">Enviar</button>
            </form>
          </div>
        ) : (
          <>
            {categoria === 'terrenos' && (
              <div className="filters">
                <div className="filter-item">
                  <select
                    value={filters.estado}
                    onChange={(e) => setFilters({ ...filters, estado: e.target.value })}
                    className="filter-select"
                  >
                    <option value="todos">Todos los estados</option>
                    <option value="disponible">Disponible</option>
                    <option value="vendido">Vendido</option>
                  </select>
                </div>

                <div className="filter-item">
                  <input
                    type="text"
                    placeholder="Ubicación"
                    value={filters.ubicacion}
                    onChange={(e) => setFilters({ ...filters, ubicacion: e.target.value })}
                    className="filter-input"
                  />
                </div>

                <div className="filter-item">
                  <input
                    type="number"
                    placeholder="Precio mínimo"
                    value={filters.precioMin}
                    onChange={(e) => setFilters({ ...filters, precioMin: Math.max(0, e.target.value) })}
                    className="filter-input"
                  />
                </div>

                <div className="filter-item">
                  <input
                    type="number"
                    placeholder="Precio máximo"
                    value={filters.precioMax}
                    onChange={(e) => setFilters({ ...filters, precioMax: Math.max(filters.precioMin, e.target.value) })}
                    className="filter-input"
                  />
                </div>

                <div className="filter-item">
                  <select
                    value={filters.moneda}
                    onChange={(e) => setFilters({ ...filters, moneda: e.target.value })}
                    className="filter-select"
                  >
                    <option value="soles">Soles</option>
                    <option value="dolares">Dólares</option>
                  </select>
                </div>
              </div>
            )}

            <div className="gallery">
              {loading ? (
                <p>Cargando datos...</p>
              ) : categoria === 'terrenos' ? (
                sortedTerrenos.map((terreno, index) => {
                  const imagenUrl = terreno.imagenes && Array.isArray(terreno.imagenes) ? terreno.imagenes[0] : '/default-image.jpg';
                  const vendedorNombre = getUsuarioDetails(terreno.usuario_id);
                  return (
                    <div key={index} className="card">
                      <div className="card-image-container">
                        <img src={imagenUrl} alt={terreno.titulo} className="card-image" />
                        <h3 className="card-title">{terreno.titulo}</h3>
                      </div>
                      <div className="card-details">
                        <p className="card-price">
                          {filters.moneda === 'soles' ? `S/ ${terreno.precio}` : `$ ${terreno.precio}`}
                        </p>
                        <p className="card-location">
                          <i className="fas fa-location-pin"></i> Lat: {terreno.ubicacion_lat}, Lon: {terreno.ubicacion_lon}
                        </p>
                        <p className="card-estado"><strong>Estado:</strong> {terreno.estado}</p>
                        <p className="card-vendedor"><strong>Vendedor:</strong> {vendedorNombre}</p>
                        <Link to={`/dashboard/terrenos/${terreno.id}`} target="_blank" rel="noopener noreferrer" className="card-button">Ver más</Link>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p>No hay datos disponibles para esta categoría.</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );

  const renderAdminView = () => (
    <div className="dashboard">
      <div className="sidebar">
        <div className="categories">
          <button
            className={`category-btn ${categoria === 'terrenos' ? 'active' : ''}`}
            onClick={() => { changeCategory('terrenos'); }}
          >
            Terrenos
          </button>
          <button
            className={`category-btn ${categoria === 'carros' ? 'active' : ''}`}
            onClick={() => { changeCategory('carros'); }}
          >
            Carros
          </button>
          <button
            className={`category-btn ${categoria === 'casas' ? 'active' : ''}`}
            onClick={() => { changeCategory('casas'); }}
          >
            Casas
          </button>
        </div>
      </div>

      <div className="main-content">
        {categoria === undefined || categoria === '' ? (
          <div className="welcome-message">
            <h2>Vista Admin</h2>
            <p>Bienvenido al panel de administración.</p>
          </div>
        ) : showForm ? (
          <div className="modal">
          <div className="modal-content">
            <h2>{editMode ? 'Editar Terreno' : 'Agregar Terreno'}</h2>
            <form onSubmit={editMode ? handleUpdateTerreno : handleCreateTerreno}>
              <label htmlFor="titulo">Título:</label>
              <input
                type="text"
                id="titulo"
                value={formData.titulo}
                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                required
              />

              <label htmlFor="descripcion">Descripción:</label>
              <textarea
                id="descripcion"
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                required
              />

              <label htmlFor="precio">Precio:</label>
              <input
                type="number"
                id="precio"
                value={formData.precio}
                onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                required
              />

              <label htmlFor="ubicacion_lat">Latitud:</label>
              <input
                type="number"
                id="ubicacion_lat"
                step="any"
                value={formData.ubicacion_lat}
                onChange={(e) => setFormData({ ...formData, ubicacion_lat: e.target.value })}
                required
              />

              <label htmlFor="ubicacion_lon">Longitud:</label>
              <input
                type="number"
                id="ubicacion_lon"
                step="any"
                value={formData.ubicacion_lon}
                onChange={(e) => setFormData({ ...formData, ubicacion_lon: e.target.value })}
                required
              />

              <label htmlFor="metros_cuadrados">Metros cuadrados:</label>
              <input
                type="number"
                id="metros_cuadrados"
                value={formData.metros_cuadrados}
                onChange={(e) => setFormData({ ...formData, metros_cuadrados: e.target.value })}
                required
              />

              <label htmlFor="imagenes">Imágenes (URL):</label>
              <input
                type="text"
                id="imagenes"
                value={formData.imagenes}
                onChange={(e) => setFormData({ ...formData, imagenes: e.target.value })}
                required
              />

              <label htmlFor="estado">Estado:</label>
              <select
                id="estado"
                value={formData.estado}
                onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
              >
                <option value="disponible">Disponible</option>
                <option value="vendido">Vendido</option>
              </select>

              <button type="submit">{editMode ? 'Confirmar' : 'Guardar Terreno'}</button>
              <button type="button" onClick={() => setShowForm(false)}>Cancelar</button>
            </form>
          </div>
        </div>
        ) : (
          <>
            {categoria === 'terrenos' && (
              <div className="filters">
                <div className="filter-item">
                  <select
                    value={filters.estado}
                    onChange={(e) => setFilters({ ...filters, estado: e.target.value })}
                    className="filter-select"
                  >
                    <option value="todos">Todos los estados</option>
                    <option value="disponible">Disponible</option>
                    <option value="vendido">Vendido</option>
                  </select>
                </div>

                <div className="filter-item">
                  <input
                    type="text"
                    placeholder="Ubicación"
                    value={filters.ubicacion}
                    onChange={(e) => setFilters({ ...filters, ubicacion: e.target.value })}
                    className="filter-input"
                  />
                </div>

                <div className="filter-item">
                  <input
                    type="number"
                    placeholder="Precio mínimo"
                    value={filters.precioMin}
                    onChange={(e) => setFilters({ ...filters, precioMin: Math.max(0, e.target.value) })}
                    className="filter-input"
                  />
                </div>

                <div className="filter-item">
                  <input
                    type="number"
                    placeholder="Precio máximo"
                    value={filters.precioMax}
                    onChange={(e) => setFilters({ ...filters, precioMax: Math.max(filters.precioMin, e.target.value) })}
                    className="filter-input"
                  />
                </div>

                <div className="filter-item">
                  <select
                    value={filters.moneda}
                    onChange={(e) => setFilters({ ...filters, moneda: e.target.value })}
                    className="filter-select"
                  >
                    <option value="soles">Soles</option>
                    <option value="dolares">Dólares</option>
                  </select>
                </div>
              </div>
            )}

            {/* Botón Agregar solo visible para admin en la categoría terrenos */}
            {usuarioLocal && usuarioLocal.tipo === 'admin' && categoria === 'terrenos' && (
            <div className="filters">
              <button
                className="add-button"
                onClick={() => {
                  setShowForm(true);
                  setEditMode(false); // Agregar un nuevo terreno
                }}
              >
                Agregar Terreno
              </button>
            </div>
            )}

            <div className="gallery">
              {loading ? (
                <p>Cargando datos...</p>
              ) : categoria === 'terrenos' ? (
                sortedTerrenos.map((terreno, index) => {
                  const imagenUrl = terreno.imagenes && Array.isArray(terreno.imagenes) ? terreno.imagenes[0] : '/default-image.jpg';
                  const vendedorNombre = getUsuarioDetails(terreno.usuario_id);
                  return (
                    <div key={index} className="card">
                      <div className="card-image-container">
                        <img src={imagenUrl} alt={terreno.titulo} className="card-image" />
                        <h3 className="card-title">{terreno.titulo}</h3>
                      </div>
                      <div className="card-details">
                        <p className="card-price">
                          {filters.moneda === 'soles' ? `S/ ${terreno.precio}` : `$ ${terreno.precio}`}
                        </p>
                        <p className="card-location">
                          <i className="fas fa-location-pin"></i> Lat: {terreno.ubicacion_lat}, Lon: {terreno.ubicacion_lon}
                        </p>
                        <p className="card-estado"><strong>Estado:</strong> {terreno.estado}</p>
                        <p className="card-vendedor"><strong>Vendedor:</strong> {vendedorNombre}</p>
                        <Link to={`/dashboard/terrenos/${terreno.id}`} target="_blank" rel="noopener noreferrer" className="card-button">Ver más</Link>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p>No hay datos disponibles para esta categoría  .</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );

  return usuarioLocal && usuarioLocal.tipo === 'admin' ? renderAdminView() : renderCompradorView();
};

export default DashboardMain;

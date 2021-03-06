import React,{useEffect} from "react";
import {toast} from "react-toastify";
import {useNavigate,useParams} from "react-router-dom";
import './Factura.css';

import { useCategorias } from "../../hooks/useCategorias";
import { useProductos } from "../../hooks/useProductos";
import { useOrden } from "../../hooks/useOrden";
import { useMesas } from "../../hooks/useMesas";
import { useFactura } from "../../hooks/useFactura";

import FacturaComponent from "./componentsFactura/FacturaComponent";
import CategoriaCardComponent from "./componentsFactura/CategoriaCardComponent";
import ProductoCardComponent from "./componentsFactura/ProductoCardComponent";
import ModalClienteComponent from "./componentsFactura/ModalClienteComponent";
import { usePersonas } from "../../hooks/usePersonas";


const Factura = () => {

    const {id:idMesa} = useParams();
    const navigate = useNavigate(); 

    const {dataPersonas,dataPersonaSelect,onSelectPersona} = usePersonas();

    const {dataMesas,buscarMesa,updateEstadoMesa} = useMesas();
    const {dataCategorias } = useCategorias();
    const {dataProductos,buscarPorCategoria,dataCategoriaBusq  } = useProductos();
    const {grabarOrden,cargarOrdenR,buscarOrdenId,updateEstadoOrden} = useOrden([]);

    const {
        dataTotalFact,
        setTotalFactData,        
        dataOrdenDetalleF,
        setOrdenDetalleFData,
        ordenDetallAddProducto,
        handleRemoveProductoF,
        handleIncrementItemF,
        handleDecrementItemF } = useFactura();


    useEffect(()=>{
        console.log("USE EFECT FACTURA cargando factura"); 
        setOrdenDetalleFData(cargaOrdenFactura(idMesa));
        return ()=>{
            console.log("USE EFECT FACTURA limpiando factura"); 
            setOrdenDetalleFData([]);
        }
    }, [dataMesas])

    useEffect(()=>{
        console.log("USE EFECT Total Factura Ejecutando");
        if(dataOrdenDetalleF.length>0){
            let totalFactura=0;
            dataOrdenDetalleF.forEach(orden =>{
                totalFactura=totalFactura+(orden.cantidad * orden.precio);
            });
            setTotalFactData(totalFactura);
        }else{
            setTotalFactData(0);
        }
        return ()=>{
            console.log("USE EFECT Total Factura Limpiando");
            setTotalFactData(0);
        }

    }, [dataOrdenDetalleF])


    const cargaOrdenFactura = ((idMesa)=>{
        const mesaFound=buscarMesa(idMesa);
        if(mesaFound){
            if(!mesaFound.idOrden==''){
                const lista=cargarOrdenR(mesaFound?.idOrden);
                if(lista==undefined){
                    return [];
                }else{
                    onSelectPersona(buscarOrdenId(mesaFound.idOrden).idCliente);
                    return lista;
                }
            }else{
                return [];
            }
        }else{
            return [];
        }
    });


    // Guardar Orden de la Mesa
    const guardarOrden = (idMesa)=>{
        let idPersona='';
        if(dataPersonaSelect.idPersona==undefined ||  dataPersonaSelect.idPersona==''){
            idPersona='-MxIAkNNDtt2H0nJ9NSb';
        }else{
            idPersona=dataPersonaSelect.idPersona;
        }
        const mesaFound= buscarMesa(idMesa);
        const idOrden = grabarOrden(mesaFound,dataTotalFact,dataOrdenDetalleF,idPersona);
        updateEstadoMesa(idMesa,idOrden,"ocupada");
        toast.success("Orden Guardada");
        setTimeout(()=>navigate('/pos'),500);
    };

    // Guardar Factura
    const facturarOrden = (idMesa)=>{
        const mesaFound= buscarMesa(idMesa);
        updateEstadoOrden(mesaFound.idOrden,'FACTURADA');
        updateEstadoMesa(idMesa,"","libre");
        toast.success("Orden Facturada");
        setTimeout(()=>navigate('/pos'),500);   
    };

    return (
        <>
            <div className="container-fluid">
                <div className="row">
                    
                    <div className="col-6">
                        <div className="categorias">
                            <CategoriaCardComponent
                                dataCategorias={dataCategorias}
                                buscarPorCategoria={buscarPorCategoria}/>
               
                        </div>
                        <div className="productos">
                            {Object.keys(dataProductos).map((id,index)=>{
                                if(dataCategoriaBusq!=''){
                                    if(dataCategoriaBusq==dataProductos[id].idCategoria){
                                        return (
                                            <ProductoCardComponent
                                                key={id}
                                                id={id}
                                                idMesa={idMesa}
                                                dataProductos={dataProductos}
                                                ordenDetallAddProducto={ordenDetallAddProducto}
                                            />
                                        );
                                    }
                                }else{
                                    return (
                                        <ProductoCardComponent
                                            key={id}
                                            id={id}
                                            idMesa={idMesa}
                                            dataProductos={dataProductos}
                                            ordenDetallAddProducto={ordenDetallAddProducto}

                                        />
                                    );
                                }
        
                            })}
                        </div>  
                    </div>
                    
                    <FacturaComponent 
                        idMesa={idMesa}
                        dataTotalFact={dataTotalFact}
                        setTotalFactData={setTotalFactData}
                        dataOrdenDetalleF={dataOrdenDetalleF}
                        dataPersonaSelect={dataPersonaSelect}
                        facturarOrden={facturarOrden}
                        guardarOrden={guardarOrden}            
                        handleRemoveProductoF={handleRemoveProductoF}
                        handleIncrementItemF={handleIncrementItemF}
                        handleDecrementItemF={handleDecrementItemF}
                       
                        
                    />
                </div>        
            </div>

            <ModalClienteComponent
                dataPersonas={dataPersonas}
                onSelectPersona={onSelectPersona}
            />
        </>
    )
}

export default Factura;
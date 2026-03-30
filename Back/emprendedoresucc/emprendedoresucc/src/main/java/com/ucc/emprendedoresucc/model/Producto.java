package com.ucc.emprendedoresucc.model;

public class Producto {

    private String nombre;
    private double precio;
    private int stock;
    private String imagen;

    // Constructor por defecto (requerido por Spring/Jackson)
    public Producto() {}

    // Constructor con parámetros
    public Producto(String nombre, double precio, int stock, String imagen) {
        this.nombre = nombre;
        this.precio = precio;
        this.stock = stock;
        this.imagen = imagen;
    }

    // Getters y Setters
    public String getNombre() { 
        return nombre; 
    }
    
    public void setNombre(String nombre) { 
        this.nombre = nombre; 
    }

    public double getPrecio() { 
        return precio; 
    }
    
    public void setPrecio(double precio) { 
        this.precio = precio; 
    }

    public int getStock() { 
        return stock; 
    }
    
    public void setStock(int stock) { 
        this.stock = stock; 
    }

    public String getImagen() { 
        return imagen; 
    }
    
    public void setImagen(String imagen) { 
        this.imagen = imagen; 
    }

    @Override
    public String toString() {
        return "Producto{" +
                "nombre='" + nombre + '\'' +
                ", precio=" + precio +
                ", stock=" + stock +
                ", imagen='" + imagen + '\'' +
                '}';
    }
}
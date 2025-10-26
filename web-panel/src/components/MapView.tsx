'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { Driver, LocationHistory } from '@/types/api'

interface DriverLocation {
  driver: Driver
  location: LocationHistory
  isOnline: boolean
}

interface MapViewProps {
  locations: DriverLocation[]
  locationHistory: LocationHistory[]
  selectedDriver: string | null
}

export default function MapView({ locations, locationHistory, selectedDriver }: MapViewProps) {
  const mapRef = useRef<L.Map | null>(null)
  const markersRef = useRef<L.Marker[]>([])
  const polylineRef = useRef<L.Polyline | null>(null)

  // Initialize map
  useEffect(() => {
    if (!mapRef.current) {
      // Create map centered on USA
      mapRef.current = L.map('map').setView([39.8283, -98.5795], 4)

      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
      }).addTo(mapRef.current)
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [])

  // Update markers when locations change
  useEffect(() => {
    if (!mapRef.current) return

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove())
    markersRef.current = []

    // Add markers for each driver
    locations.forEach(({ driver, location, isOnline }) => {
      const iconColor = isOnline ? '#22c55e' : '#6b7280' // green or gray

      const icon = L.divIcon({
        className: 'custom-marker',
        html: `
          <div style="
            background-color: ${iconColor};
            width: 24px;
            height: 24px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          "></div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      })

      const driverName = driver.firstName || driver.lastName
        ? `${driver.firstName || ''} ${driver.lastName || ''}`.trim()
        : driver.username

      const marker = L.marker([location.latitude, location.longitude], { icon })
        .addTo(mapRef.current!)
        .bindPopup(`
          <div style="min-width: 200px;">
            <h3 style="margin: 0 0 8px 0; font-weight: bold; color: #000;">${driverName}</h3>
            <div style="font-size: 12px; color: #666; line-height: 1.5;">
              <div><strong>Status:</strong> ${isOnline ? '🟢 Online' : '⚪ Offline'}</div>
              ${location.speed ? `<div><strong>Speed:</strong> ${(location.speed * 2.237).toFixed(1)} mph</div>` : ''}
              <div><strong>Location:</strong> ${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}</div>
              <div><strong>Updated:</strong> ${new Date(location.createdAt).toLocaleString()}</div>
            </div>
          </div>
        `)

      markersRef.current.push(marker)
    })

    // Fit bounds if we have markers
    if (locations.length > 0) {
      const bounds = L.latLngBounds(locations.map(l => [l.location.latitude, l.location.longitude]))
      mapRef.current!.fitBounds(bounds, { padding: [50, 50] })
    }
  }, [locations])

  // Draw route polyline for location history
  useEffect(() => {
    if (!mapRef.current) return

    // Remove existing polyline
    if (polylineRef.current) {
      polylineRef.current.remove()
      polylineRef.current = null
    }

    // Draw new polyline if we have history
    if (locationHistory.length > 1) {
      const latlngs = locationHistory.map(loc => [loc.latitude, loc.longitude] as [number, number])

      polylineRef.current = L.polyline(latlngs, {
        color: '#3b82f6', // blue
        weight: 3,
        opacity: 0.7
      }).addTo(mapRef.current!)

      // Fit bounds to show the entire route
      mapRef.current!.fitBounds(polylineRef.current.getBounds(), { padding: [50, 50] })

      // Add start marker
      const startIcon = L.divIcon({
        className: 'custom-marker',
        html: `
          <div style="
            background-color: #10b981;
            width: 16px;
            height: 16px;
            border-radius: 50%;
            border: 2px solid white;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          "></div>
        `,
        iconSize: [16, 16],
        iconAnchor: [8, 8]
      })

      L.marker(latlngs[0], { icon: startIcon })
        .addTo(mapRef.current!)
        .bindPopup('<strong>Start</strong>')

      // Add end marker
      const endIcon = L.divIcon({
        className: 'custom-marker',
        html: `
          <div style="
            background-color: #ef4444;
            width: 16px;
            height: 16px;
            border-radius: 50%;
            border: 2px solid white;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          "></div>
        `,
        iconSize: [16, 16],
        iconAnchor: [8, 8]
      })

      L.marker(latlngs[latlngs.length - 1], { icon: endIcon })
        .addTo(mapRef.current!)
        .bindPopup('<strong>Current Position</strong>')
    }
  }, [locationHistory])

  return (
    <div
      id="map"
      style={{ width: '100%', height: '100%', background: '#0f0f0f' }}
    />
  )
}

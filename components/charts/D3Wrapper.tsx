"use client"

import { useEffect, useRef } from "react"
import * as d3 from "d3"

interface D3WrapperProps {
  chartType: "line" | "bar" | "pie" | "area" | "scatter"
  data: any[]
  config?: Record<string, any>
  width?: number
  height?: number
  className?: string
}

export default function D3Wrapper({
  chartType,
  data,
  config = {},
  width,
  height = 300,
  className = "",
}: D3WrapperProps) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!svgRef.current || !data.length) return

    const svg = d3.select(svgRef.current)
    svg.selectAll("*").remove()

    const margin = { top: 20, right: 30, bottom: 40, left: 40 }
    const containerWidth = width || svgRef.current.clientWidth
    const containerHeight = height
    const innerWidth = containerWidth - margin.left - margin.right
    const innerHeight = containerHeight - margin.top - margin.bottom

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`)

    switch (chartType) {
      case "bar":
        const xScale = d3
          .scaleBand()
          .domain(data.map((d) => d.name))
          .range([0, innerWidth])
          .padding(0.1)

        const yScale = d3
          .scaleLinear()
          .domain([0, d3.max(data, (d) => d.value) || 0])
          .range([innerHeight, 0])

        g.selectAll(".bar")
          .data(data)
          .enter()
          .append("rect")
          .attr("class", "bar")
          .attr("x", (d) => xScale(d.name) || 0)
          .attr("width", xScale.bandwidth())
          .attr("y", (d) => yScale(d.value))
          .attr("height", (d) => innerHeight - yScale(d.value))
          .attr("fill", "#8884d8")

        g.append("g").attr("transform", `translate(0,${innerHeight})`).call(d3.axisBottom(xScale))

        g.append("g").call(d3.axisLeft(yScale))
        break

      case "line":
        const xScaleLine = d3
          .scalePoint()
          .domain(data.map((d) => d.name))
          .range([0, innerWidth])

        const yScaleLine = d3
          .scaleLinear()
          .domain(d3.extent(data, (d) => d.value) as [number, number])
          .range([innerHeight, 0])

        const line = d3
          .line<any>()
          .x((d) => xScaleLine(d.name) || 0)
          .y((d) => yScaleLine(d.value))
          .curve(d3.curveMonotoneX)

        g.append("path")
          .datum(data)
          .attr("fill", "none")
          .attr("stroke", "#8884d8")
          .attr("stroke-width", 2)
          .attr("d", line)

        g.selectAll(".dot")
          .data(data)
          .enter()
          .append("circle")
          .attr("class", "dot")
          .attr("cx", (d) => xScaleLine(d.name) || 0)
          .attr("cy", (d) => yScaleLine(d.value))
          .attr("r", 4)
          .attr("fill", "#8884d8")

        g.append("g").attr("transform", `translate(0,${innerHeight})`).call(d3.axisBottom(xScaleLine))

        g.append("g").call(d3.axisLeft(yScaleLine))
        break

      case "pie":
        const radius = Math.min(innerWidth, innerHeight) / 2
        const color = d3.scaleOrdinal(d3.schemeCategory10)

        const pie = d3
          .pie<any>()
          .sort(null)
          .value((d) => d.value)

        const arc = d3
          .arc<any>()
          .innerRadius(0)
          .outerRadius(radius - 1)

        const arcs = g
          .selectAll(".arc")
          .data(pie(data))
          .enter()
          .append("g")
          .attr("class", "arc")
          .attr("transform", `translate(${innerWidth / 2},${innerHeight / 2})`)

        arcs
          .append("path")
          .attr("d", arc)
          .attr("fill", (d, i) => color(i.toString()))

        arcs
          .append("text")
          .attr("transform", (d) => `translate(${arc.centroid(d)})`)
          .attr("dy", "0.35em")
          .style("text-anchor", "middle")
          .text((d) => d.data.name)
        break
    }
  }, [data, chartType, width, height])

  return (
    <div className={`w-full ${className}`} style={{ height }}>
      <svg ref={svgRef} width="100%" height="100%" />
    </div>
  )
}

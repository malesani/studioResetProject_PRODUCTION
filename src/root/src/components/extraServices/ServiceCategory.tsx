import React, { useState } from 'react';
import {
  MDBCard,
  MDBCardHeader,
  MDBCardBody,
  MDBIcon,
  MDBCollapse,
  MDBBadge,
  MDBRow,
  MDBCol,
} from 'mdb-react-ui-kit';
import { APICustTeamMemberInfo } from "../../api_module/CustomerTeamMemberRequest";

import { ServiceCard } from './ServiceCard';
// import { ServiceDetails } from './ServiceDetails';

interface ServiceCategoryProps {
  title: string;
  description: string;
  /** nome icona MDB/FontAwesome, senza prefisso */
  icon: string;
  services: Array<{
    id: string;
    name: string;
    description: string;
  }>;
  selectedServices: string[];
  onToggleService: (id: string) => void;
  teamMembers: APICustTeamMemberInfo[];
}

export function ServiceCategory({
  title,
  description,
  icon,
  services,
  selectedServices,
  onToggleService,
  teamMembers
}: ServiceCategoryProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const selectedCount = services.filter(s => selectedServices.includes(s.id)).length;

  return (
    <MDBCard className="mb-4">
      <MDBCardHeader
        onClick={() => setIsExpanded(prev => !prev)}
        role="button"
        className="d-flex align-items-center justify-content-between border-0 "
      >
        <div className="d-flex align-items-center">
          <MDBIcon fas icon={icon} size='lg' className="me-4" />
          <div>
            <h5 className="mb-1">{title}</h5>
            <p className="mb-0 text-muted small">{description}</p>
          </div>
        </div>
        <div className="d-flex align-items-center">
          {selectedCount > 0 && (
            <MDBBadge color="primary" pill className="me-3">
              {selectedCount} selezionat{selectedCount === 1 ? 'o' : 'i'}
            </MDBBadge>
          )}
          <MDBIcon fas icon={isExpanded ? 'chevron-up' : 'chevron-down'} />
        </div>
      </MDBCardHeader>

      <MDBCollapse open={isExpanded}>
        <MDBCardBody>
          <MDBRow className="g-3">
            {services.map(service => (
              <MDBCol key={service.id} md="6" xl="4">
                <ServiceCard
                 
                  {...service}
                  teamMembers={teamMembers}
                  isSelected={selectedServices.includes(service.id)}
                  onToggle={() => onToggleService(service.id)}
                />
                {/*
                {selectedServices.includes(service.id) && (
                  <ServiceDetails serviceId={service.id} />
                )}*/}
              </MDBCol>
            ))}
          </MDBRow>
        </MDBCardBody>
      </MDBCollapse>
    </MDBCard>
  );
}

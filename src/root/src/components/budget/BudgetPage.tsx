import React, { useState } from 'react';
import {
    MDBCard,
    MDBTabs,
    MDBTabsItem,
    MDBTabsLink,
    MDBTabsContent,
    MDBTabsPane,
    MDBCardHeader,
    MDBCardBody,
    MDBIcon,
    MDBCollapse,

} from 'mdb-react-ui-kit';

import { General_ContentSwitcher, ContentConfig } from '../../app_components/General_ContentSwitcher';
import GeneralTable, { ColumnConfig, ActionConfig } from "../../app_components/GeneralTable";

export interface BudgetItem {
  project_uid:   string;
  budgetItem_uid:           string;
  category:           string;
  title:          string;
  description:          number;
  budget:       number;
  cost:   string;
}

export const BudgetPage: React.FC = () => {
    // Configurazione delle sezioni dell’accordion
    const contents: ContentConfig[] = [
        {
            icon: 'palette',
            title: 'Allestimento',
            startOpen: true,
            contentElement: (
                <MDBCardBody className="p-2 pb-0">
                    <GeneralTable
                        title="Membri del Team"
                        icon="users"
                        columns={teamMemberColumns}
                        fields={teamMemberFields}
                        params={{ customer_uid }}
                        rowKey='teamMember_uid'
                        actions={teamMemberActionsConfig}
                        getData={getCustomerTeamMembersList}
                        createData={createCustomerTeamMemberInfo}
                        updateData={updateCustomerTeamMemberInfo}
                        deleteData={deleteCustomerTeamMember}
                        enableCreate={true}
                        visibleUpdate={row => row.email !== "team.member.2@stsmail.com"}
                        visibleDelete={row => row.email !== "ciao@ciao.it"}
                        disableNotVisible={{ update: false, delete: false }}
                        onRegisterRefresh={(fn) => {
                            refreshTableRef.current = fn;   // salva la funzione in ref
                        }}
                    />
                </MDBCardBody>
            ),
        },
    ];

    return (<General_ContentSwitcher switchMode='pannels' contents={contents} />);
};

import * as React from 'react';
import styles from './PnPControls.module.scss';
import { IPnPControlsProps, IPnPControlsState } from './IPnPControlsProps';
import { escape } from '@microsoft/sp-lodash-subset';

// PnP imports
import { sp } from "@pnp/sp";
import { Placeholder } from '@pnp/spfx-controls-react/lib/Placeholder';
import { WebPartTitle } from "@pnp/spfx-controls-react/lib/WebPartTitle";
import { ListView, IViewField } from '@pnp/spfx-controls-react/lib/ListView';

export default class PnPControls extends React.Component<IPnPControlsProps, IPnPControlsState> {

  private _viewFields: IViewField[] = [
    {
      name: "Id",
      displayName: "ID",
      maxWidth: 25,
      minWidth: 25,
      sorting: true
    },
    {
      name: "File.Name",
      linkPropertyName: "File.ServerRelativeUrl",
      displayName: "Name",
      sorting: true
    }
  ];

  constructor(props: IPnPControlsProps) {
    super(props);

    this.state = {
      items: [],
    };
  }

  public render(): React.ReactElement<IPnPControlsProps> {
    if (this.props.list === null || this.props.list === "" || this.props.list === undefined) {
      return (
        <Placeholder
          iconName="Edit"
          iconText="Configure your web part"
          description="Please configure the web part."
          buttonLabel="Configure"
          onConfigure={this._onConfigure.bind(this)} />
      );
    }
    return (
      this.state.items.length === 0 ?
        (
          <Placeholder
            iconName="InfoSolid"
            iconText="No items found"
            description="No items to display" />
        ) : (
          <div>
            <WebPartTitle displayMode={this.props.displayMode}
              title={this.props.title}
              updateProperty={this.props.updateTitle} />
            <ListView items={this.state.items}
              viewFields={this._viewFields}
              selection={this._getSelection}
              iconFieldName="File.ServerRelativeUrl" />
          </div>
        )
    );
  }

  private _onConfigure() {
    this.props.context.propertyPane.open();
  }

  private async _getItems() {
    let select = '*';
    let expand = 'File';
    let filter = '';

    // filter by selected term if required
    if (this.props.term !== undefined && this.props.term !== null && this.props.term.length > 0) {
      const term = this.props.term[0];

      select = `${select},TaxCatchAll/Term`;
      expand = `${expand},TaxCatchAll`;
      filter = `TaxCatchAll/Term eq '${term.name}'`;
    }

    const items = await sp.web.lists.getById(this.props.list).items
      .select(select)
      .expand(expand)
      .filter(filter)
      .get();

    // update state
    this.setState({
      items: items ? items : []
    });
    console.log('List Items:', this.state.items);
  }

  public componentDidMount() {
    if (this.props.list !== null && this.props.list !== "" && this.props.list !== undefined) {
      this._getItems();
    }
  }

  public componentDidUpdate(prevProps: IPnPControlsProps, prevState: IPnPControlsState) {
    if (this.props.list !== prevProps.list || this.props.term !== prevProps.term) {
      if (this.props.list !== null && this.props.list !== "" && this.props.list !== undefined) {
        this._getItems();
      }
    }
  }

  private _getSelection(items: any[]) {
    console.log('Selected List items:', items);
  }
}

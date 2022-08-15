import { HTMLTable } from "@blueprintjs/core";
import { DatasetProduct } from "common/products";

interface ListingProps {
  listing: DatasetProduct[];
}
export default function Listing({ listing }: ListingProps) {
  return (
    <div id="listing" className="inner-content">
      <HTMLTable>
        <thead>
          <tr>
            <th>{lang.listName}</th>
            <th>{lang.listUnit}</th>
            <th>{lang.listPrice}</th>
          </tr>
        </thead>
        <tbody>
          {listing.map((i, j) => (
            <tr key={i.id + j.toString()}>
              <td>{i.name}</td>
              <td>{i.unit}</td>
              <td>{i.price}</td>
            </tr>
          ))}
        </tbody>
      </HTMLTable>
    </div>
  );
}

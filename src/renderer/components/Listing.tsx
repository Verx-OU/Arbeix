import { Button, HTMLTable } from "@blueprintjs/core";
import { useNavigate } from "react-router-dom";
import { DatasetProduct } from "types/products";
import { pushProductToDebugSchema } from "./Debug";

interface ListingProps {
  listing: DatasetProduct[];
  goSelectProduct: () => void;
}
export default function Listing({ listing, goSelectProduct }: ListingProps) {
  const navigate = useNavigate();
  return (
    <div id="listing" className="inner-content">
      <Button large icon="plus" intent="success" text={lang.addProduct} onClick={goSelectProduct} />
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
      <Button
        large
        icon="hand-left"
        intent="danger"
        text={lang.debugPushToSchema}
        onClick={() => {
          for (const i of listing) {
            pushProductToDebugSchema(i);
          }
          navigate("/debug");
        }}
      />
    </div>
  );
}

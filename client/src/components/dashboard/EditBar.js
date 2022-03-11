import React, { useState } from "react";

import SelectWidget from "./SelectWidget";

const EditBar = ({
	userWidget,
	widgets,
	move,
	resize,
	deleteWidget,
	selectedWidgetID,
	setSelectedWidgetID,
}) => {
	const [height, setHeight] = useState(userWidget.height);
	const [width, setWidth] = useState(userWidget.width);
	const [show, setShow] = useState(true);
	return show ? (
		<>
			{widgets && (
				<SelectWidget
					widgets={widgets}
					selectedWidgetID={selectedWidgetID}
					setSelectedWidgetID={setSelectedWidgetID}
				/>
			)}
			<div style={{ display: "flex" }}>
				<button
					key={`${userWidget._id}-button-back`}
					onClick={() => move(userWidget._id, -1)}
				>
					&lt;
				</button>
				<span key={`${userWidget._id}-current-position`}>
					&nbsp;{userWidget.position}&nbsp;
				</span>
				<button
					key={`${userWidget._id}-button-forward`}
					onClick={() => move(userWidget._id, 1)}
				>
					&gt;
				</button>
				<label
					key={`${userWidget._id}-width-label`}
					htmlFor={`${userWidget._id}-width`}
				>
					w:
				</label>

				<input
					name={`${userWidget._id}-width`}
					key={`${userWidget._id}-width-input`}
					type="number"
					step="1"
					style={{ width: "3.2em" }}
					value={width}
					min={1}
					onChange={(e) => {
						const _width = +e.target.value;
						setWidth(_width);
						resize(userWidget._id, _width, height);
					}}
				/>
				<label
					key={`${userWidget._id}-height-label`}
					htmlFor={`${userWidget._id}-height-input`}
				>
					h:
				</label>
				<input
					name={`${userWidget._id}-height`}
					key={`${userWidget._id}-height-input`}
					type="number"
					step="1"
					style={{ width: "3.2em" }}
					value={height}
					min={1}
					onChange={(e) => {
						const _height = +e.target.value;
						setHeight(_height);
						resize(userWidget._id, width, _height);
					}}
				/>
				<div key={`${userWidget._id}-delete-button-frame`}>
					<button
						key={`${userWidget._id}-delete-button`}
						style={{
							background: "red",
						}}
						onClick={() => {
							setShow(false);
							setTimeout(() => deleteWidget(userWidget._id), 350);
						}}
					>
						X{userWidget._id}
					</button>
				</div>
			</div>
		</>
	) : (
		<div>
			<b key="deleting-bold">deleting...</b>
		</div>
	);
};

export default EditBar;

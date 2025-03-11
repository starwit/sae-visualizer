package de.starwit.websocket;

import java.time.LocalDateTime;

public class TrajectoryDTO {

	/**
	 * From which stream is this data coming from?
	 */
	private String streamId;

	/**
     * This ID defines, what kind of object this is.
     */
    private int classId;

    /**
     * Unique ID to track an object over time.
     */
    private String objectId;

    private boolean hasGeoCoordinates = false;

	private Coordinates coordinates = new Coordinates();

	private LocalDateTime receiveTimestamp;

    public String getStreamId() {
		return streamId;
	}

	public void setStreamId(String streamId) {
		this.streamId = streamId;
	}	

	public int getClassId() {
		return classId;
	}

	public void setClassId(int classId) {
		this.classId = classId;
	}

	public String getObjectId() {
		return objectId;
	}

	public void setObjectId(String objectId) {
		this.objectId = objectId;
	}

	public boolean isHasGeoCoordinates() {
		return hasGeoCoordinates;
	}

	public void setHasGeoCoordinates(boolean hasGeoCoordinates) {
		this.hasGeoCoordinates = hasGeoCoordinates;
	}

    public Coordinates getCoordinates() {
		return coordinates;
	}

	public void setCoordinates(Coordinates coordinates) {
		this.coordinates = coordinates;
	}	

	public LocalDateTime getReceiveTimestamp() {
		return receiveTimestamp;
	}

	public void setReceiveTimestamp(LocalDateTime receiveTimestamp) {
		this.receiveTimestamp = receiveTimestamp;
	}

	@Override
	public String toString() {
		return "TrajectoryDTO [streamId=" + streamId + ", classId=" + classId + ", objectId=" + objectId
				+ ", hasGeoCoordinates=" + hasGeoCoordinates + ", coordinates=" + coordinates + ", receiveTimestamp="
				+ receiveTimestamp + "]";
	}



	class Coordinates {
		private double latitude;
		private double longitude;
		private double x;
		private double y;

		public double getLatitude() {
			return latitude;
		}
	
		public void setLatitude(double latitude) {
			this.latitude = latitude;
		}
	
		public double getLongitude() {
			return longitude;
		}
	
		public void setLongitude(double longitude) {
			this.longitude = longitude;
		}
	
		public double getX() {
			return x;
		}
	
		public void setX(double x) {
			this.x = x;
		}
	
		public double getY() {
			return y;
		}
	
		public void setY(double y) {
			this.y = y;
		}

		@Override
		public String toString() {
			return "Coordinates [latitude=" + latitude + ", longitude=" + longitude + ", x=" + x + ", y=" + y + "]";
		}
	}
}

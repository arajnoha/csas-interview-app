interface Props {
    progressWidth: number;
}

const Progress = ({ progressWidth } : Props) => {
  return (
    <div className="progress">
        <div className="progress-slide" style={{"width": progressWidth + "%"}}></div>
    </div>
  )
}

export default Progress